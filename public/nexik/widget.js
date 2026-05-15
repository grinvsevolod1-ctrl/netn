/**
 * Nexik AI Chat Widget v2.0
 * Production-ready embeddable widget
 * 
 * Usage:
 * <script>
 *   (function(w,d,s,o,f,js,fjs){
 *     w['NexikWidget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
 *     js=d.createElement(s);fjs=d.getElementsByTagName(s)[0];
 *     js.id=o;js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);
 *   }(window,document,'script','nexik','https://netnext.site/nexik/widget.js'));
 *   nexik('init', { widgetId: 'YOUR_WIDGET_ID', apiKey: 'nxk_live_...' });
 * </script>
 */

(function(window, document) {
  'use strict';

  const VERSION = '2.0.0';
  const API_BASE = 'https://netnext.site/api/nexik/v1';
  
  // State
  let config = null;
  let widgetConfig = null;
  let visitorId = null;
  let conversationId = null;
  let messages = [];
  let isOpen = false;
  let isTyping = false;
  let isInitialized = false;

  // DOM elements
  let widget = null;
  let container = null;
  let messagesEl = null;
  let inputEl = null;

  // Generate visitor ID
  function getVisitorId() {
    const stored = localStorage.getItem('nexik_visitor_id');
    if (stored) return stored;
    
    const id = 'v_' + Date.now().toString(36) + Math.random().toString(36).slice(2);
    localStorage.setItem('nexik_visitor_id', id);
    return id;
  }

  // API calls
  async function apiCall(endpoint, options = {}) {
    const url = (config.apiBase || API_BASE) + endpoint;
    const headers = {
      'Content-Type': 'application/json',
      'X-API-Key': config.apiKey,
      'X-Widget-ID': config.widgetId
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: { ...headers, ...options.headers }
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'API error');
      }
      
      return response.json();
    } catch (error) {
      console.error('[Nexik]', error);
      throw error;
    }
  }

  // Fetch widget config
  async function fetchWidgetConfig() {
    try {
      widgetConfig = await apiCall('/widget?widget_id=' + config.widgetId, { method: 'GET' });
      return widgetConfig;
    } catch {
      // Use defaults if fetch fails
      widgetConfig = {
        theme: {
          position: 'bottom-right',
          primaryColor: '#00ffff',
          backgroundColor: '#0a0a0f',
          textColor: '#ffffff',
          borderRadius: 16,
          bubbleSize: 60,
          zIndex: 9999
        },
        greeting_message: 'Привет! Чем могу помочь?',
        placeholder_text: 'Введите сообщение...',
        quick_replies: []
      };
      return widgetConfig;
    }
  }

  // Load message history
  async function loadHistory() {
    try {
      const data = await apiCall(`/messages?visitor_id=${visitorId}`, { method: 'GET' });
      if (data.conversation_id) {
        conversationId = data.conversation_id;
        messages = data.messages || [];
        renderMessages();
      }
    } catch {
      // Ignore history load errors
    }
  }

  // Send message
  async function sendMessage(text) {
    if (!text.trim() || isTyping) return;

    const userMessage = {
      id: 'temp_' + Date.now(),
      content: text,
      sender: 'visitor',
      timestamp: new Date().toISOString()
    };
    
    messages.push(userMessage);
    renderMessages();
    
    inputEl.value = '';
    isTyping = true;
    showTyping();

    try {
      const response = await apiCall('/chat', {
        method: 'POST',
        body: JSON.stringify({
          visitor_id: visitorId,
          message: text,
          page_url: window.location.href,
          page_title: document.title,
          visitor_info: config.visitorInfo || {}
        })
      });

      conversationId = response.conversation_id;
      
      // Update user message with real ID
      userMessage.id = response.message.id;
      
      if (response.ai_response) {
        messages.push({
          id: response.ai_response.id,
          content: response.ai_response.content,
          sender: response.ai_response.sender,
          timestamp: response.ai_response.timestamp,
          quick_replies: response.ai_response.quick_replies
        });
      }

      hideTyping();
      renderMessages();
      
      // Check quota warning
      if (response.quota?.remaining < 50 && response.quota?.remaining > 0) {
        console.warn('[Nexik] Low message quota:', response.quota.remaining);
      }
      
    } catch (error) {
      hideTyping();
      messages.push({
        id: 'error_' + Date.now(),
        content: 'Извините, произошла ошибка. Попробуйте позже.',
        sender: 'system',
        timestamp: new Date().toISOString()
      });
      renderMessages();
    }

    isTyping = false;
  }

  // Render messages
  function renderMessages() {
    if (!messagesEl) return;

    messagesEl.innerHTML = '';

    if (messages.length === 0) {
      messagesEl.innerHTML = `
        <div class="nexik-welcome">
          <div class="nexik-welcome-text">${widgetConfig.greeting_message}</div>
          ${renderQuickReplies(widgetConfig.quick_replies)}
        </div>
      `;
      return;
    }

    for (const msg of messages) {
      const msgEl = document.createElement('div');
      msgEl.className = `nexik-msg nexik-msg-${msg.sender}`;
      msgEl.innerHTML = `
        <div class="nexik-msg-content">${escapeHtml(msg.content)}</div>
        ${msg.quick_replies?.length ? renderQuickReplies(msg.quick_replies) : ''}
      `;
      messagesEl.appendChild(msgEl);
    }

    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function renderQuickReplies(replies) {
    if (!replies?.length) return '';
    return `
      <div class="nexik-quick-replies">
        ${replies.map(r => `
          <button class="nexik-quick-reply" data-message="${escapeHtml(r.message || r.label)}">
            ${escapeHtml(r.label)}
          </button>
        `).join('')}
      </div>
    `;
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'nexik-typing';
    el.id = 'nexik-typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    messagesEl?.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function hideTyping() {
    document.getElementById('nexik-typing')?.remove();
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Build widget styles
  function buildStyles() {
    const t = widgetConfig.theme;
    const pos = t.position || 'bottom-right';
    const isLeft = pos.includes('left');
    const isTop = pos.includes('top');
    
    return `
      .nexik-widget{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;line-height:1.5;--nx-primary:${t.primaryColor};--nx-bg:${t.backgroundColor};--nx-text:${t.textColor};--nx-radius:${t.borderRadius}px;--nx-z:${t.zIndex}}
      .nexik-btn{position:fixed;${isLeft?'left':'right'}:20px;${isTop?'top':'bottom'}:20px;width:${t.bubbleSize}px;height:${t.bubbleSize}px;border-radius:50%;background:var(--nx-primary);border:none;cursor:pointer;box-shadow:0 4px 20px rgba(0,255,255,0.3);z-index:var(--nx-z);display:flex;align-items:center;justify-content:center;transition:all .3s}
      .nexik-btn:hover{transform:scale(1.1);box-shadow:0 6px 30px rgba(0,255,255,0.5)}
      .nexik-btn svg{width:28px;height:28px;fill:var(--nx-bg)}
      .nexik-box{position:fixed;${isLeft?'left':'right'}:20px;${isTop?'top:90px':'bottom:90px'};width:380px;max-width:calc(100vw - 40px);height:550px;max-height:calc(100vh - 120px);background:var(--nx-bg);border:1px solid rgba(0,255,255,0.2);border-radius:var(--nx-radius);box-shadow:0 20px 60px rgba(0,0,0,0.5),0 0 40px rgba(0,255,255,0.1);z-index:var(--nx-z);display:flex;flex-direction:column;overflow:hidden;opacity:0;transform:translateY(20px) scale(0.95);pointer-events:none;transition:all .3s cubic-bezier(0.4,0,0.2,1)}
      .nexik-box.open{opacity:1;transform:translateY(0) scale(1);pointer-events:auto}
      .nexik-header{background:linear-gradient(135deg,rgba(0,255,255,0.1) 0%,rgba(0,255,255,0.05) 100%);border-bottom:1px solid rgba(0,255,255,0.2);padding:16px 20px;display:flex;align-items:center;gap:12px}
      .nexik-avatar{width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,var(--nx-primary),rgba(0,255,255,0.5));display:flex;align-items:center;justify-content:center;box-shadow:0 0 20px rgba(0,255,255,0.3)}
      .nexik-avatar svg{width:24px;height:24px;fill:var(--nx-bg)}
      .nexik-info{flex:1}
      .nexik-name{font-weight:600;font-size:16px;color:var(--nx-text)}
      .nexik-status{font-size:12px;color:var(--nx-primary);display:flex;align-items:center;gap:6px}
      .nexik-status::before{content:'';width:8px;height:8px;background:var(--nx-primary);border-radius:50%;box-shadow:0 0 10px var(--nx-primary)}
      .nexik-close{background:rgba(255,255,255,0.1);border:none;border-radius:8px;width:36px;height:36px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s}
      .nexik-close:hover{background:rgba(255,255,255,0.2)}
      .nexik-close svg{width:20px;height:20px;fill:var(--nx-text);opacity:0.7}
      .nexik-msgs{flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:16px;scrollbar-width:thin;scrollbar-color:rgba(0,255,255,0.3) transparent}
      .nexik-msgs::-webkit-scrollbar{width:6px}
      .nexik-msgs::-webkit-scrollbar-thumb{background:rgba(0,255,255,0.3);border-radius:3px}
      .nexik-welcome{text-align:center;padding:30px 20px}
      .nexik-welcome-text{color:rgba(255,255,255,0.7);font-size:15px;margin-bottom:20px}
      .nexik-msg{max-width:85%;animation:nexik-fade .3s}
      .nexik-msg-visitor{align-self:flex-end}
      .nexik-msg-visitor .nexik-msg-content{background:var(--nx-primary);color:var(--nx-bg);border-radius:var(--nx-radius) var(--nx-radius) 4px var(--nx-radius);padding:12px 16px;font-weight:500}
      .nexik-msg-ai,.nexik-msg-operator,.nexik-msg-system{align-self:flex-start}
      .nexik-msg-ai .nexik-msg-content,.nexik-msg-operator .nexik-msg-content{background:rgba(255,255,255,0.1);color:var(--nx-text);border-radius:var(--nx-radius) var(--nx-radius) var(--nx-radius) 4px;padding:12px 16px;border:1px solid rgba(0,255,255,0.1)}
      .nexik-msg-system .nexik-msg-content{background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.6);border-radius:var(--nx-radius);padding:10px 14px;text-align:center;font-size:13px}
      .nexik-quick-replies{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
      .nexik-quick-reply{background:rgba(0,255,255,0.1);border:1px solid rgba(0,255,255,0.3);color:var(--nx-primary);padding:8px 16px;border-radius:20px;font-size:13px;cursor:pointer;transition:all .2s}
      .nexik-quick-reply:hover{background:rgba(0,255,255,0.2);transform:translateY(-1px)}
      .nexik-typing{align-self:flex-start;background:rgba(255,255,255,0.1);padding:16px 20px;border-radius:var(--nx-radius);display:flex;gap:6px}
      .nexik-typing span{width:8px;height:8px;background:var(--nx-primary);border-radius:50%;animation:nexik-bounce 1.4s infinite}
      .nexik-typing span:nth-child(2){animation-delay:.2s}
      .nexik-typing span:nth-child(3){animation-delay:.4s}
      @keyframes nexik-bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}
      @keyframes nexik-fade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
      .nexik-input-area{padding:16px 20px;border-top:1px solid rgba(0,255,255,0.1);display:flex;gap:12px;background:rgba(0,0,0,0.3)}
      .nexik-input{flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(0,255,255,0.2);border-radius:24px;padding:12px 20px;font-size:14px;color:var(--nx-text);outline:none;transition:all .2s}
      .nexik-input::placeholder{color:rgba(255,255,255,0.4)}
      .nexik-input:focus{border-color:var(--nx-primary);box-shadow:0 0 20px rgba(0,255,255,0.2)}
      .nexik-send{width:48px;height:48px;border-radius:50%;background:var(--nx-primary);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;box-shadow:0 4px 15px rgba(0,255,255,0.3)}
      .nexik-send:hover:not(:disabled){transform:scale(1.05);box-shadow:0 6px 20px rgba(0,255,255,0.4)}
      .nexik-send:disabled{opacity:0.5;cursor:not-allowed}
      .nexik-send svg{width:20px;height:20px;fill:var(--nx-bg)}
      .nexik-footer{text-align:center;padding:10px;font-size:11px;color:rgba(255,255,255,0.3);border-top:1px solid rgba(255,255,255,0.05)}
      .nexik-footer a{color:var(--nx-primary);text-decoration:none}
      @media(max-width:480px){.nexik-box{width:100%;height:100%;max-height:100%;bottom:0;left:0;right:0;border-radius:0;border:none}.nexik-btn{bottom:16px;${isLeft?'left':'right'}:16px}}
    `;
  }

  // Build widget HTML
  function buildWidget() {
    const icons = {
      chat: '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>',
      close: '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
      send: '<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>',
      bot: '<svg viewBox="0 0 24 24"><path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 011 1v3a1 1 0 01-1 1h-1v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1H2a1 1 0 01-1-1v-3a1 1 0 011-1h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2M7.5 13A1.5 1.5 0 006 14.5 1.5 1.5 0 007.5 16 1.5 1.5 0 009 14.5 1.5 1.5 0 007.5 13m9 0a1.5 1.5 0 00-1.5 1.5 1.5 1.5 0 001.5 1.5 1.5 1.5 0 001.5-1.5 1.5 1.5 0 00-1.5-1.5M9 18v2h6v-2l2 2v-2a2 2 0 00-2-2h-4a2 2 0 00-2 2v2l2-2z"/></svg>'
    };

    const orgName = widgetConfig.organization?.name || 'AI Ассистент';

    widget = document.createElement('div');
    widget.className = 'nexik-widget';
    widget.innerHTML = `
      <style>${buildStyles()}</style>
      <button class="nexik-btn" aria-label="Открыть чат">${icons.chat}</button>
      <div class="nexik-box">
        <div class="nexik-header">
          <div class="nexik-avatar">${icons.bot}</div>
          <div class="nexik-info">
            <div class="nexik-name">${escapeHtml(orgName)}</div>
            <div class="nexik-status">Онлайн</div>
          </div>
          <button class="nexik-close" aria-label="Закрыть">${icons.close}</button>
        </div>
        <div class="nexik-msgs"></div>
        <div class="nexik-input-area">
          <input class="nexik-input" type="text" placeholder="${escapeHtml(widgetConfig.placeholder_text)}" />
          <button class="nexik-send" aria-label="Отправить">${icons.send}</button>
        </div>
        <div class="nexik-footer">Powered by <a href="https://netnext.site/nexik" target="_blank" rel="noopener">Nexik</a></div>
      </div>
    `;

    document.body.appendChild(widget);

    // Cache elements
    container = widget.querySelector('.nexik-box');
    messagesEl = widget.querySelector('.nexik-msgs');
    inputEl = widget.querySelector('.nexik-input');

    // Event listeners
    widget.querySelector('.nexik-btn').addEventListener('click', () => toggle());
    widget.querySelector('.nexik-close').addEventListener('click', () => close());
    widget.querySelector('.nexik-send').addEventListener('click', () => sendMessage(inputEl.value));
    inputEl.addEventListener('keypress', (e) => e.key === 'Enter' && sendMessage(inputEl.value));

    // Quick reply clicks
    widget.addEventListener('click', (e) => {
      if (e.target.classList.contains('nexik-quick-reply')) {
        sendMessage(e.target.dataset.message);
      }
    });

    // Initial render
    renderMessages();
  }

  // Public API
  function open() {
    if (!isInitialized) return;
    isOpen = true;
    container?.classList.add('open');
    inputEl?.focus();
  }

  function close() {
    isOpen = false;
    container?.classList.remove('open');
  }

  function toggle() {
    isOpen ? close() : open();
  }

  function setVisitorInfo(info) {
    if (config) {
      config.visitorInfo = { ...config.visitorInfo, ...info };
    }
  }

  // Initialize
  async function init(options) {
    if (isInitialized) {
      console.warn('[Nexik] Already initialized');
      return;
    }

    if (!options.widgetId || !options.apiKey) {
      console.error('[Nexik] widgetId and apiKey are required');
      return;
    }

    config = {
      widgetId: options.widgetId,
      apiKey: options.apiKey,
      apiBase: options.apiBase || API_BASE,
      visitorInfo: options.visitorInfo || {}
    };

    visitorId = getVisitorId();

    try {
      await fetchWidgetConfig();
      buildWidget();
      await loadHistory();
      isInitialized = true;
      console.log('[Nexik] Widget initialized v' + VERSION);
      
      // Auto-open if configured
      if (options.autoOpen) {
        setTimeout(open, options.autoOpenDelay || 3000);
      }
    } catch (error) {
      console.error('[Nexik] Initialization failed:', error);
    }
  }

  // Process queued commands
  function processQueue() {
    const queue = window.nexik?.q || [];
    for (const args of queue) {
      const [cmd, ...params] = args;
      if (cmd === 'init') init(params[0]);
      else if (cmd === 'open') open();
      else if (cmd === 'close') close();
      else if (cmd === 'toggle') toggle();
      else if (cmd === 'setVisitor') setVisitorInfo(params[0]);
    }
  }

  // Export public API
  window.nexik = function(cmd, ...args) {
    if (cmd === 'init') init(args[0]);
    else if (cmd === 'open') open();
    else if (cmd === 'close') close();
    else if (cmd === 'toggle') toggle();
    else if (cmd === 'setVisitor') setVisitorInfo(args[0]);
  };
  window.nexik.version = VERSION;

  // Auto-init from script tag data attributes
  function autoInit() {
    const script = document.currentScript || document.querySelector('script[data-id]');
    if (script) {
      const widgetId = script.getAttribute('data-id');
      const apiKey = script.getAttribute('data-key') || widgetId; // Use widget ID as key for simple setup
      
      if (widgetId) {
        init({
          widgetId,
          apiKey,
          autoOpen: script.hasAttribute('data-auto-open'),
          autoOpenDelay: parseInt(script.getAttribute('data-auto-open-delay') || '3000')
        });
      }
    }
  }

  // Process queue on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      processQueue();
      autoInit();
    });
  } else {
    processQueue();
    autoInit();
  }

})(window, document);

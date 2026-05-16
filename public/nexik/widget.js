/**
 * Nexik AI Chat Widget v3.1
 * Production-ready embeddable widget with Modal & Mini modes
 * 
 * Usage (Script tag - simplest):
 * <script src="https://nexik.io/widget.js" data-id="YOUR_WIDGET_ID"></script>
 * 
 * Usage (with options):
 * <script 
 *   src="https://nexik.io/widget.js"
 *   data-id="YOUR_WIDGET_ID"
 *   data-display-mode="modal"
 *   data-modal-size="lg"
 *   data-position="bottom-right"
 *   async
 * ></script>
 * 
 * Or programmatic:
 * Nexik.init({ clientId: 'YOUR_ID', displayMode: 'modal' });
 * Nexik.open();
 * Nexik.setMode('mini');
 */

(function(window, document) {
  'use strict';

  const VERSION = '3.1.0';
  
  // State
  let config = {
    clientId: '',
    color: '#4fd1c5',
    position: 'bottom-right',
    greeting: 'Привет! Чем могу помочь?',
    botName: 'Nexik',
    displayMode: 'modal', // 'modal' | 'mini'
    modalSize: 'lg', // 'sm' | 'md' | 'lg' | 'xl'
    apiEndpoint: '/api/nexik/chat' // Nexik client API
  };
  
  let sessionId = null;
  let messages = [];
  let isOpen = false;
  let isTyping = false;
  let isInitialized = false;

  // DOM elements
  let widget = null;
  let backdrop = null;
  let container = null;
  let messagesEl = null;
  let inputEl = null;

  // Generate session ID
  function getSessionId() {
    const stored = localStorage.getItem('nexik_session_id');
    if (stored) return stored;
    
    const id = 's_' + Date.now().toString(36) + Math.random().toString(36).slice(2);
    localStorage.setItem('nexik_session_id', id);
    return id;
  }

  // Load message history
  function loadHistory() {
    try {
      const stored = localStorage.getItem('nexik_messages_' + config.clientId);
      if (stored) {
        messages = JSON.parse(stored).slice(-50);
      }
    } catch {
      messages = [];
    }
  }

  // Save message history
  function saveHistory() {
    try {
      localStorage.setItem('nexik_messages_' + config.clientId, JSON.stringify(messages.slice(-50)));
    } catch {
      // Ignore
    }
  }

  // Send message
  async function sendMessage(text) {
    if (!text.trim() || isTyping) return;

    const userMessage = {
      id: 'msg_' + Date.now(),
      content: text.trim(),
      role: 'user',
      timestamp: new Date().toISOString()
    };
    
    messages.push(userMessage);
    renderMessages();
    saveHistory();
    
    inputEl.value = '';
    inputEl.style.height = 'auto';
    isTyping = true;
    showTyping();

    try {
      const baseUrl = config.apiEndpoint.startsWith('http') 
        ? config.apiEndpoint 
        : (window.location.origin + config.apiEndpoint);
      
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: config.clientId,
          message: text.trim(),
          sessionId: sessionId,
          context: {
            companyName: config.botName,
            assistantName: config.botName
          },
          previousMessages: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      const data = await response.json();
      
      const aiMessage = {
        id: 'msg_' + Date.now(),
        content: data.text || data.response || data.message || 'Извините, произошла ошибка.',
        role: 'assistant',
        timestamp: new Date().toISOString()
      };
      
      messages.push(aiMessage);
      saveHistory();
      
    } catch (error) {
      console.error('[Nexik]', error);
      messages.push({
        id: 'msg_' + Date.now(),
        content: 'Извините, произошла ошибка. Попробуйте позже.',
        role: 'assistant',
        timestamp: new Date().toISOString()
      });
    }

    hideTyping();
    renderMessages();
    isTyping = false;
  }

  // Render messages
  function renderMessages() {
    if (!messagesEl) return;

    messagesEl.innerHTML = '';

    if (messages.length === 0) {
      messagesEl.innerHTML = `
        <div class="nexik-welcome">
          <div class="nexik-orb"></div>
          <div class="nexik-welcome-title">${escapeHtml(config.botName)}</div>
          <div class="nexik-welcome-text">${escapeHtml(config.greeting)}</div>
          <div class="nexik-quick-actions">
            <button class="nexik-quick-btn" data-msg="Расскажите об услугах">Узнать об услугах</button>
            <button class="nexik-quick-btn" data-msg="Хочу записаться на консультацию">Записаться на консультацию</button>
            <button class="nexik-quick-btn" data-msg="Свяжите с оператором">Связаться с оператором</button>
          </div>
        </div>
      `;
      return;
    }

    for (const msg of messages) {
      const msgEl = document.createElement('div');
      msgEl.className = `nexik-msg nexik-msg-${msg.role}`;
      
      if (msg.role === 'user') {
        msgEl.innerHTML = `
          <div class="nexik-msg-content">${escapeHtml(msg.content)}</div>
          <div class="nexik-msg-avatar nexik-avatar-user">
            <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          </div>
        `;
      } else {
        msgEl.innerHTML = `
          <div class="nexik-msg-avatar nexik-avatar-ai">
            <div class="nexik-mini-orb"></div>
          </div>
          <div class="nexik-msg-content">${escapeHtml(msg.content)}</div>
        `;
      }
      
      messagesEl.appendChild(msgEl);
    }

    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'nexik-msg nexik-msg-assistant';
    el.id = 'nexik-typing';
    el.innerHTML = `
      <div class="nexik-msg-avatar nexik-avatar-ai">
        <div class="nexik-mini-orb"></div>
      </div>
      <div class="nexik-typing-dots">
        <span></span><span></span><span></span>
      </div>
    `;
    messagesEl?.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function hideTyping() {
    document.getElementById('nexik-typing')?.remove();
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  }

  // Get modal size in CSS
  function getModalSize() {
    const sizes = { sm: '50vw', md: '60vw', lg: '70vw', xl: '80vw' };
    return sizes[config.modalSize] || '70vw';
  }

  // Build widget styles
  function buildStyles() {
    const c = config.color;
    const pos = config.position;
    const isLeft = pos.includes('left');
    const isModal = config.displayMode === 'modal';
    const modalWidth = getModalSize();
    
    return `
      .nexik-widget{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;line-height:1.5;--nx-primary:${c};--nx-bg:#0a0a0f;--nx-card:#111118;--nx-text:#fff;--nx-muted:rgba(255,255,255,0.6);--nx-border:rgba(255,255,255,0.1)}
      
      /* Trigger Button */
      .nexik-btn{position:fixed;${isLeft?'left':'right'}:20px;bottom:20px;width:72px;height:72px;border-radius:50%;background:transparent;border:none;cursor:pointer;z-index:9998;padding:0;transition:transform .3s}
      .nexik-btn:hover{transform:scale(1.05)}
      .nexik-btn canvas{width:100%;height:100%}
      
      /* Backdrop (modal only) */
      .nexik-backdrop{position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);z-index:9999;opacity:0;pointer-events:none;transition:opacity .3s}
      .nexik-backdrop.open{opacity:1;pointer-events:auto}
      
      /* Chat Container */
      .nexik-box{position:fixed;z-index:10000;display:flex;flex-direction:column;background:var(--nx-bg);border:1px solid var(--nx-border);box-shadow:0 25px 80px rgba(0,0,0,0.5),0 0 60px rgba(79,209,197,0.1);opacity:0;pointer-events:none;transition:all .3s cubic-bezier(0.4,0,0.2,1)}
      .nexik-box.open{opacity:1;pointer-events:auto}
      
      /* Modal mode */
      .nexik-box.mode-modal{top:50%;left:50%;transform:translate(-50%,-50%) scale(0.95);width:${modalWidth};max-width:calc(100vw - 40px);height:80vh;max-height:calc(100vh - 80px);border-radius:20px}
      .nexik-box.mode-modal.open{transform:translate(-50%,-50%) scale(1)}
      
      /* Mini mode */
      .nexik-box.mode-mini{${isLeft?'left':'right'}:20px;bottom:100px;width:380px;max-width:calc(100vw - 40px);height:550px;max-height:calc(100vh - 140px);border-radius:16px;transform:translateY(20px) scale(0.95)}
      .nexik-box.mode-mini.open{transform:translateY(0) scale(1)}
      
      /* Header */
      .nexik-header{display:flex;align-items:center;gap:12px;padding:16px 20px;border-bottom:1px solid var(--nx-border);background:linear-gradient(135deg,rgba(79,209,197,0.05) 0%,transparent 100%)}
      .nexik-header-orb{width:40px;height:40px;flex-shrink:0}
      .nexik-header-orb canvas{width:100%;height:100%}
      .nexik-header-info{flex:1;min-width:0}
      .nexik-header-name{font-weight:600;font-size:15px;color:var(--nx-text)}
      .nexik-header-status{font-size:12px;color:var(--nx-primary);display:flex;align-items:center;gap:6px}
      .nexik-header-status::before{content:'';width:6px;height:6px;background:var(--nx-primary);border-radius:50%;box-shadow:0 0 8px var(--nx-primary)}
      .nexik-header-actions{display:flex;gap:4px}
      .nexik-header-btn{width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,0.05);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s}
      .nexik-header-btn:hover{background:rgba(255,255,255,0.1)}
      .nexik-header-btn svg{width:18px;height:18px;fill:var(--nx-muted)}
      
      /* Messages */
      .nexik-msgs{flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:16px;scrollbar-width:thin;scrollbar-color:rgba(79,209,197,0.3) transparent}
      .nexik-msgs::-webkit-scrollbar{width:6px}
      .nexik-msgs::-webkit-scrollbar-thumb{background:rgba(79,209,197,0.3);border-radius:3px}
      
      /* Welcome */
      .nexik-welcome{display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;padding:40px 20px;text-align:center}
      .nexik-orb{width:100px;height:100px;margin-bottom:24px}
      .nexik-orb canvas{width:100%;height:100%}
      .nexik-welcome-title{font-size:18px;font-weight:600;color:var(--nx-text);margin-bottom:8px}
      .nexik-welcome-text{color:var(--nx-muted);font-size:14px;max-width:280px;margin-bottom:32px}
      .nexik-quick-actions{display:flex;flex-direction:column;gap:8px;width:100%;max-width:300px}
      .nexik-quick-btn{display:flex;align-items:center;gap:12px;padding:14px 18px;background:rgba(255,255,255,0.03);border:1px solid var(--nx-border);border-radius:12px;color:var(--nx-text);font-size:14px;cursor:pointer;transition:all .2s;text-align:left}
      .nexik-quick-btn:hover{background:rgba(79,209,197,0.1);border-color:rgba(79,209,197,0.3);transform:translateX(4px)}
      
      /* Message */
      .nexik-msg{display:flex;gap:10px;max-width:85%;animation:nexik-fade .3s}
      .nexik-msg-user{align-self:flex-end;flex-direction:row-reverse}
      .nexik-msg-assistant{align-self:flex-start}
      .nexik-msg-avatar{width:32px;height:32px;border-radius:10px;flex-shrink:0;display:flex;align-items:center;justify-content:center}
      .nexik-avatar-user{background:rgba(79,209,197,0.2)}
      .nexik-avatar-user svg{width:18px;height:18px;fill:var(--nx-primary)}
      .nexik-avatar-ai{background:linear-gradient(135deg,rgba(79,209,197,0.3),rgba(99,179,237,0.2))}
      .nexik-mini-orb{width:20px;height:20px;border-radius:50%;background:linear-gradient(135deg,var(--nx-primary),#63b3ed);animation:nexik-pulse 2s ease-in-out infinite}
      .nexik-msg-content{padding:12px 16px;border-radius:16px;font-size:14px;line-height:1.5;white-space:pre-wrap;word-break:break-word}
      .nexik-msg-user .nexik-msg-content{background:var(--nx-primary);color:#000;border-bottom-right-radius:4px}
      .nexik-msg-assistant .nexik-msg-content{background:var(--nx-card);color:var(--nx-text);border:1px solid var(--nx-border);border-bottom-left-radius:4px}
      
      /* Typing */
      .nexik-typing-dots{display:flex;gap:4px;padding:16px 20px;background:var(--nx-card);border:1px solid var(--nx-border);border-radius:16px;border-bottom-left-radius:4px}
      .nexik-typing-dots span{width:8px;height:8px;background:var(--nx-primary);border-radius:50%;animation:nexik-bounce 1.4s infinite}
      .nexik-typing-dots span:nth-child(2){animation-delay:.2s}
      .nexik-typing-dots span:nth-child(3){animation-delay:.4s}
      
      /* Input */
      .nexik-input-area{padding:16px 20px;border-top:1px solid var(--nx-border);display:flex;gap:12px;align-items:flex-end;background:rgba(0,0,0,0.2)}
      .nexik-input-wrap{flex:1;position:relative}
      .nexik-input-wrap::before{content:'';position:absolute;inset:-1px;border-radius:14px;background:linear-gradient(135deg,var(--nx-primary),#63b3ed);opacity:0;transition:opacity .2s;pointer-events:none}
      .nexik-input-wrap:focus-within::before{opacity:1}
      .nexik-input{width:100%;background:rgba(255,255,255,0.05);border:1px solid var(--nx-border);border-radius:14px;padding:12px 16px;font-size:14px;color:var(--nx-text);outline:none;resize:none;max-height:120px;position:relative;transition:border-color .2s}
      .nexik-input::placeholder{color:var(--nx-muted)}
      .nexik-input:focus{border-color:transparent}
      .nexik-send{width:48px;height:48px;border-radius:14px;background:var(--nx-primary);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0}
      .nexik-send:hover:not(:disabled){transform:scale(1.05);box-shadow:0 4px 20px rgba(79,209,197,0.4)}
      .nexik-send:disabled{opacity:0.4;cursor:not-allowed}
      .nexik-send svg{width:20px;height:20px;fill:#000}
      
      /* Footer */
      .nexik-footer{text-align:center;padding:10px;font-size:11px;color:var(--nx-muted);border-top:1px solid var(--nx-border);opacity:0.5}
      .nexik-footer a{color:var(--nx-primary);text-decoration:none}
      
      /* Animations */
      @keyframes nexik-fade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
      @keyframes nexik-bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}
      @keyframes nexik-pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.1);opacity:0.8}}
      
      /* Mobile */
      @media(max-width:640px){
        .nexik-box.mode-modal,.nexik-box.mode-mini{width:100%;height:100%;max-width:100%;max-height:100%;top:0;left:0;right:0;bottom:0;border-radius:0;transform:translateY(100%)}
        .nexik-box.mode-modal.open,.nexik-box.mode-mini.open{transform:translateY(0)}
        .nexik-btn{bottom:16px;${isLeft?'left':'right'}:16px;width:64px;height:64px}
      }
    `;
  }

  // Draw Siri-like orb on canvas
  function drawOrb(canvas, size, isAnimating = true) {
    const ctx = canvas.getContext('2d');
    canvas.width = size * 2;
    canvas.height = size * 2;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    
    let time = 0;
    
    function draw() {
      time += 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const baseRadius = size * 0.7;
      
      // Outer glow
      const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius * 1.3);
      glowGrad.addColorStop(0, 'rgba(79, 209, 197, 0.3)');
      glowGrad.addColorStop(0.5, 'rgba(79, 209, 197, 0.1)');
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius * 1.3, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw morphing blob layers
      for (let layer = 0; layer < 3; layer++) {
        ctx.beginPath();
        const layerOffset = layer * 0.15;
        const layerRadius = baseRadius * (1 - layer * 0.15);
        
        for (let i = 0; i <= 360; i += 5) {
          const angle = (i * Math.PI) / 180;
          const wave1 = Math.sin(angle * 3 + time + layerOffset) * (isAnimating ? 4 : 2);
          const wave2 = Math.cos(angle * 4 - time * 0.7 + layerOffset) * (isAnimating ? 3 : 1.5);
          const wave3 = Math.sin(angle * 2 + time * 1.3 + layerOffset) * (isAnimating ? 2 : 1);
          const r = layerRadius + wave1 + wave2 + wave3;
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        
        const colors = [
          ['#4fd1c5', '#319795'],
          ['#63b3ed', '#4fd1c5'],
          ['#81e6d9', '#63b3ed']
        ];
        
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, layerRadius);
        grad.addColorStop(0, colors[layer][0] + (layer === 0 ? 'ff' : '80'));
        grad.addColorStop(1, colors[layer][1] + (layer === 0 ? 'dd' : '40'));
        ctx.fillStyle = grad;
        ctx.fill();
      }
      
      // Inner core glow
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius * 0.5);
      coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      coreGrad.addColorStop(0.3, 'rgba(200, 255, 250, 0.4)');
      coreGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius * 0.5, 0, Math.PI * 2);
      ctx.fill();
      
      if (isAnimating) {
        requestAnimationFrame(draw);
      }
    }
    
    draw();
    return { stop: () => isAnimating = false };
  }

  // Build widget HTML
  function buildWidget() {
    const icons = {
      close: '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
      send: '<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>',
      minimize: '<svg viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z"/></svg>',
      expand: '<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>'
    };

    widget = document.createElement('div');
    widget.className = 'nexik-widget';
    widget.innerHTML = `
      <style>${buildStyles()}</style>
      <button class="nexik-btn" aria-label="Открыть чат"><canvas></canvas></button>
      <div class="nexik-backdrop"></div>
      <div class="nexik-box mode-${config.displayMode}">
        <div class="nexik-header">
          <div class="nexik-header-orb"><canvas></canvas></div>
          <div class="nexik-header-info">
            <div class="nexik-header-name">${escapeHtml(config.botName)}</div>
            <div class="nexik-header-status">Онлайн</div>
          </div>
          <div class="nexik-header-actions">
            <button class="nexik-header-btn nexik-btn-mode" aria-label="Сменить режим">${config.displayMode === 'modal' ? icons.minimize : icons.expand}</button>
            <button class="nexik-header-btn nexik-btn-close" aria-label="Закрыть">${icons.close}</button>
          </div>
        </div>
        <div class="nexik-msgs"></div>
        <div class="nexik-input-area">
          <div class="nexik-input-wrap">
            <textarea class="nexik-input" rows="1" placeholder="Напишите сообщение..."></textarea>
          </div>
          <button class="nexik-send" aria-label="Отправить">${icons.send}</button>
        </div>
        <div class="nexik-footer">Powered by <a href="https://netnext.site/nexik" target="_blank" rel="noopener">Nexik</a></div>
      </div>
    `;

    document.body.appendChild(widget);

    // Cache elements
    backdrop = widget.querySelector('.nexik-backdrop');
    container = widget.querySelector('.nexik-box');
    messagesEl = widget.querySelector('.nexik-msgs');
    inputEl = widget.querySelector('.nexik-input');

    // Draw orbs
    const btnCanvas = widget.querySelector('.nexik-btn canvas');
    const headerCanvas = widget.querySelector('.nexik-header-orb canvas');
    drawOrb(btnCanvas, 72, true);
    drawOrb(headerCanvas, 40, true);

    // Event listeners
    widget.querySelector('.nexik-btn').addEventListener('click', toggle);
    widget.querySelector('.nexik-btn-close').addEventListener('click', close);
    widget.querySelector('.nexik-btn-mode').addEventListener('click', toggleMode);
    backdrop.addEventListener('click', close);
    widget.querySelector('.nexik-send').addEventListener('click', () => sendMessage(inputEl.value));
    
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(inputEl.value);
      }
    });
    
    inputEl.addEventListener('input', () => {
      inputEl.style.height = 'auto';
      inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + 'px';
    });

    // Quick action clicks
    widget.addEventListener('click', (e) => {
      if (e.target.classList.contains('nexik-quick-btn')) {
        sendMessage(e.target.dataset.msg);
      }
    });

    // Escape to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) close();
    });

    // Initial render
    renderMessages();
    
    // Draw welcome orb after messages rendered
    setTimeout(() => {
      const welcomeOrb = widget.querySelector('.nexik-welcome .nexik-orb');
      if (welcomeOrb) {
        const canvas = document.createElement('canvas');
        welcomeOrb.appendChild(canvas);
        drawOrb(canvas, 100, true);
      }
    }, 100);
  }

  // Toggle display mode
  function toggleMode() {
    const newMode = config.displayMode === 'modal' ? 'mini' : 'modal';
    setMode(newMode);
  }

  function setMode(mode) {
    config.displayMode = mode;
    container.classList.remove('mode-modal', 'mode-mini');
    container.classList.add('mode-' + mode);
    
    // Update mode button icon
    const modeBtn = widget.querySelector('.nexik-btn-mode');
    modeBtn.innerHTML = mode === 'modal' 
      ? '<svg viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z"/></svg>'
      : '<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>';
    
    // Show/hide backdrop
    if (isOpen) {
      backdrop.classList.toggle('open', mode === 'modal');
    }
  }

  // Public API
  function open() {
    if (!isInitialized) return;
    isOpen = true;
    container?.classList.add('open');
    if (config.displayMode === 'modal') {
      backdrop?.classList.add('open');
    }
    inputEl?.focus();
  }

  function close() {
    isOpen = false;
    container?.classList.remove('open');
    backdrop?.classList.remove('open');
  }

  function toggle() {
    isOpen ? close() : open();
  }

  // Initialize
  function init(options = {}) {
    if (isInitialized) {
      console.warn('[Nexik] Already initialized');
      return;
    }

    // Merge config
    Object.assign(config, options);
    
    // Also check script tag attributes (support both data-id and data-client-id)
    const script = document.currentScript || document.querySelector('script[data-client-id],script[data-id]');
    if (script) {
      config.clientId = script.getAttribute('data-id') || script.getAttribute('data-client-id') || config.clientId;
      config.color = script.getAttribute('data-color') || config.color;
      config.position = script.getAttribute('data-position') || config.position;
      config.greeting = script.getAttribute('data-greeting') || config.greeting;
      config.botName = script.getAttribute('data-bot-name') || config.botName;
      config.displayMode = script.getAttribute('data-display-mode') || config.displayMode;
      config.modalSize = script.getAttribute('data-modal-size') || config.modalSize;
    }

    sessionId = getSessionId();
    loadHistory();
    buildWidget();
    isInitialized = true;
    
    console.log('[Nexik] Widget v' + VERSION + ' initialized');
  }

  // Export public API
  window.Nexik = {
    init,
    open,
    close,
    toggle,
    setMode,
    version: VERSION
  };

  // Auto-init from script tag
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(window, document);

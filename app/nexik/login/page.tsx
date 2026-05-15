"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react"

export default function NexikLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/nexik/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Ошибка входа")
        setLoading(false)
        return
      }

      // Success - redirect to dashboard
      router.push("/nexik/dashboard")
    } catch {
      setError("Ошибка соединения")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050507] flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00ffff]/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#ff00aa]/5 rounded-full blur-[150px]" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/nexik" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00ffff] to-[#00cc99] flex items-center justify-center">
              <span className="text-black font-bold text-xl">N</span>
            </div>
            <span className="text-2xl font-bold text-white group-hover:text-[#00ffff] transition-colors">
              Nexik
            </span>
          </Link>
        </div>

        {/* Login card */}
        <div className="bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-2">Вход в аккаунт</h1>
          <p className="text-slate-400 mb-8">
            Войдите чтобы управлять вашим AI-ассистентом
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#12121a] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#00ffff]/50 focus:ring-1 focus:ring-[#00ffff]/50 transition-all"
                placeholder="you@company.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Пароль
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#12121a] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#00ffff]/50 focus:ring-1 focus:ring-[#00ffff]/50 transition-all pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#00ffff] to-[#00cc99] text-black font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Вход...
                </>
              ) : (
                <>
                  Войти
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center space-y-4">
            <Link
              href="/nexik/forgot-password"
              className="text-sm text-slate-400 hover:text-[#00ffff] transition-colors"
            >
              Забыли пароль?
            </Link>
            
            <div className="text-slate-500">
              Нет аккаунта?{" "}
              <Link
                href="/nexik/start"
                className="text-[#00ffff] hover:underline"
              >
                Создать бесплатно
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-sm mt-8">
          Часть экосистемы{" "}
          <Link href="/" className="text-[#00ffff] hover:underline">
            NetNext
          </Link>
        </p>
      </div>
    </div>
  )
}

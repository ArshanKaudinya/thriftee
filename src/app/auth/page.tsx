'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleAuth = async () => {
    setLoading(true)
    setError('')
    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password
        })

        if (signUpError) throw signUpError

        if (data.user) {
          await supabase.from('users').upsert({
            id: data.user.id,
            email,
            name,
            city,
            date_joined: new Date().toISOString()
          })
        }

        router.push('/profile')
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (signInError) throw signInError

        router.push('/profile')
      }
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  const isValidEmail = email.includes('@') && email.includes('.')
  const isValidPassword = password.length >= 6
  const isValidName = name.length >= 2
  const isValidForm = isValidEmail && isValidPassword && (mode === 'login' || isValidName)

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-surface border border-subtext rounded-xl shadow-md p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-primary mb-4 text-center">
          {mode === 'login' ? 'Login' : 'Sign Up'} to Thriftee
        </h1>

        <div className="flex flex-col gap-4">
          {mode === 'signup' && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-subtext rounded-xl bg-background text-text placeholder-subtext"
            />
          )}
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-subtext rounded-xl bg-background text-text placeholder-subtext"
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 pr-10 border border-subtext rounded-xl bg-background text-text placeholder-subtext"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-subtext"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {mode === 'signup' && (
            <input
              type="text"
              placeholder="City (optional)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-2 border border-subtext rounded-xl bg-background text-text placeholder-subtext"
            />
          )}
          <button
            onClick={handleAuth}
            disabled={!isValidForm || loading}
            className={`w-full py-2 rounded-xl font-medium transition ${isValidForm && !loading ? 'bg-slate-400 text-blue hover:opacity-90' : 'bg-slate-100 text-blue'}`}
          >
            {loading ? (mode === 'signup' ? 'Signing up...' : 'Logging in...') : (mode === 'signup' ? 'Sign Up' : 'Login')}
          </button>
        </div>

        {error && <p className={`text-sm mt-2 text-center text-error`}>{error}</p>}

        <button
          onClick={() => {
            setMode(mode === 'login' ? 'signup' : 'login')
            setError('')
          }}
          className="text-sm mt-6 text-accent underline mx-auto block"
        >
          Switch to {mode === 'login' ? 'Signup' : 'Login'}
        </button>
      </div>
    </div>
  )
}

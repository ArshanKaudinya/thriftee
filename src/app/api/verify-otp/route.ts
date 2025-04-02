import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { email, otp } = await req.json()
  const cutoff = new Date(Date.now() - 10 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('email_otp')
    .select('*')
    .eq('email', email)
    .eq('otp', otp)
    .gte('created_at', cutoff)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 })
  }

  await supabase.from('email_otp').delete().eq('email', email)

  return NextResponse.json({ verified: true })
}

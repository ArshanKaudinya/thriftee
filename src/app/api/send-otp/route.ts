import { resend } from '@/lib/resend'
import { supabase } from '@/lib/supabase'
import { randomInt } from 'crypto'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { email } = await req.json()
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const otp = randomInt(100000, 999999).toString()

  const { error: insertError } = await supabase.from('email_otp').insert({
    email,
    otp,
    created_at: new Date().toISOString()
  })

  if (insertError) {
    return NextResponse.json({ error: 'Failed to store OTP' }, { status: 500 })
  }

  const { error: sendError } = await resend.emails.send({
    from: 'Thriftee <onboarding@resend.dev>',
    to: email,
    subject: 'Your Thriftee OTP',
    html: `<p>Your OTP is: <strong>${otp}</strong></p><p>This code will expire in 10 minutes.</p>`
  })

  if (insertError) {
    console.error('Supabase Insert Error:', insertError)
    return NextResponse.json({ error: 'Failed to store OTP' }, { status: 500 })
  }
  
  if (sendError) {
    console.error('Resend Send Error:', sendError)
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
  

  return NextResponse.json({ success: true })
}

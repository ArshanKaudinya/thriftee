import './globals.css'
import Navbar from '@/components/Navbar'
import LottiePreload from '@/components/LottiePreload'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Thriftee',
  description: 'Buy, sell, and request items locally',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LottiePreload />
        <Navbar />
        <main className="min-h-screen bg-background text-text">
          {children}
        </main>
      </body>
    </html>
  )
}



import './globals.css'
import Navbar from '@/components/Navbar'
import LottiePreload from '@/components/LottiePreload'
import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next';
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { UserProvider } from '@/lib/UserContext'

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
        <UserProvider>
          <Navbar />
          <Toaster
            position="top-right"
            richColors
            expand
            visibleToasts={2}
            closeButton
            offset={24}
          />
          <Analytics />
          <main className="min-h-[91vh] bg-background text-text">
            {children}
          </main>
        </UserProvider>
      </body>
    </html>
  )
}



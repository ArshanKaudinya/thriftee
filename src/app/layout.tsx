import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import '@/styles/globals.css'

export const metadata = { title: 'Thriftee', description: 'Buy. Sell. Reuse.' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-text">
        <Navbar />
        <main className="min-h-screen px-4 py-6">{children}</main>
        <Footer />
      </body>
    </html>
  )
}

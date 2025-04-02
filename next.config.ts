const SUPABASE_DOMAIN = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).host

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [SUPABASE_DOMAIN],
  }
}

export default nextConfig

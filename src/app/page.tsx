'use client'

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center text-center px-4 py-16 space-y-8">
      <h1 className="text-4xl font-bold text-primary italic">Welcome to Thriftee</h1>
      <p className="text-subtext max-w-xl">
        Thriftee is your community-driven marketplace for posting, requesting, and chatting about second-hand items.
      </p>

      <ul className="space-y-3 text-left max-w-md w-full text-accent font-medium">
        <li><a href="/browse" className="hover:underline">→ Browse all posted items</a></li>
        <li><a href="/items/new" className="hover:underline">→ Post something to sell</a></li>
        <li><a href="/items/request" className="hover:underline">→ Request an item you need</a></li>
        <li><a href="/chat" className="hover:underline">→ Go to chat</a></li>
        <li><a href="/profile" className="hover:underline">→ View your profile</a></li>
        <li><a href="/auth" className="hover:underline">→ Login / Signup</a></li>
      </ul>
    </div>
  )
}

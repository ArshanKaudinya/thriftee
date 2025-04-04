'use client'

import { toast } from 'sonner'

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

      <div className="flex flex-wrap gap-4 pt-8">
        <button
          className="px-4 py-2 rounded-xl bg-green-100 text-green-800 hover:opacity-90 border border-green-300"
          onClick={() => toast.success('This is a success toast!')}
        >
          Success Toast
        </button>
        <button
          className="px-4 py-2 rounded-xl bg-red-100 text-red-800 hover:opacity-90 border border-red-300"
          onClick={() => toast.error('Something went wrong!')}
        >
          Error Toast
        </button>
        <button
          className="px-4 py-2 rounded-xl bg-yellow-100 text-yellow-800 hover:opacity-90 border border-yellow-300"
          onClick={() => toast('This is a neutral toast')}
        >
          Neutral Toast
        </button>
        <button
          className="px-4 py-2 rounded-xl bg-blue-100 text-blue-800 hover:opacity-90 border border-blue-300"
          onClick={() =>
            toast('Uploading...', {
              description: 'Might take a few seconds.',
              action: {
                label: 'Cancel',
                onClick: () => toast.info('Cancelled')
              }
            })
          }
        >
          Toast with Action
        </button>
      </div>
    </div>
  )
}

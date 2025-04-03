'use client'
import { useEffect } from 'react'

let lottieCache: Record<string, unknown> | null = null

export function getCachedLottie(): Record<string, unknown> | null {
  return lottieCache
}

export default function LottiePreload() {
  useEffect(() => {
    if (!lottieCache) {
      fetch('/assets/loading.json')
        .then((res) => res.json())
        .then((data: Record<string, unknown>) => {
          lottieCache = data
        })
        .catch(console.error)
    }
  }, [])

  return null
}


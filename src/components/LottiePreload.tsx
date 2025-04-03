'use client'
import { useEffect } from 'react'

let lottieCache: any = null

export function getCachedLottie() {
  return lottieCache
}

export default function LottiePreload() {
  useEffect(() => {
    if (!lottieCache) {
      fetch('/assets/loading.json')
        .then((res) => res.json())
        .then((data) => { lottieCache = data })
    }
  }, [])

  return null
}

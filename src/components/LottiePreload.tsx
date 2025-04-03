'use client'

import { useEffect } from 'react'
import { getLoadingAnimation } from '@/lib/loadingAnimation'

export default function LottiePreload() {
  useEffect(() => {
    getLoadingAnimation()
  }, [])

  return null
}

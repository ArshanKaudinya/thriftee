let cachedAnimation: any = null

export async function getLoadingAnimation(): Promise<any> {
  if (cachedAnimation) return cachedAnimation

  const res = await fetch('/assets/loading.json')
  cachedAnimation = await res.json()
  return cachedAnimation
}

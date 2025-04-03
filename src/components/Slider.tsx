'use client'

import * as SliderPrimitive from '@radix-ui/react-slider'

export function Slider({
  value,
  onValueChange,
  min,
  max,
  step,
}: {
  value: number[]
  onValueChange: (val: number[]) => void
  min: number
  max: number
  step: number
}) {
  return (
    <SliderPrimitive.Root
      className="relative flex items-center select-none touch-none w-full h-5"
      value={value}
      onValueChange={onValueChange}
      min={min}
      max={max}
      step={step}
    >
      <SliderPrimitive.Track className="bg-gray-200 relative grow rounded-full h-1">
        <SliderPrimitive.Range className="absolute bg-slate-400 rounded-full h-full" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block w-4 h-4 bg-slate-400 rounded-full border border-gray-300 shadow-sm focus:outline-none" />
    </SliderPrimitive.Root>
  )
}

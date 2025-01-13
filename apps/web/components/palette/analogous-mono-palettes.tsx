'use client'

import { useColorStore } from '@/context/color-store-provider'
import { useToolStore } from '@/store/toolStore'
import { cn } from '@ui/lib/utils'
import { motion } from 'motion/react'
import { Copy } from 'lucide-react'
import tinycolor from 'tinycolor2'

function AnalogousMonochromaticPalettes({ className }: { className?: string }) {
  const primary = useColorStore((s) => s.primary)

  return (
    <div className={cn('grid grid-cols-2 gap-4', className)}>
      <PillPalette color={primary} type="analogous" />
      <PillPalette color={primary} type="monochromatic" />
    </div>
  )
}

const PillPalette = ({
  color,
  type,
}: {
  color: string
  type: 'analogous' | 'monochromatic'
}) => {
  const { colorMode: mode } = useToolStore()
  const colors =
    type === 'monochromatic'
      ? tinycolor(color).monochromatic(6)
      : tinycolor(color).analogous(6)
  colors.sort((a, b) => {
    return tinycolor(b).getBrightness() - tinycolor(a).getBrightness()
  })
  const colorString = (c: tinycolor.Instance) => {
    switch (mode) {
      case 'hex':
        return c.toHexString()
      case 'rgb':
        return c.toRgbString()
      case 'hsl':
        return c.toHslString()
    }
  }
  return (
    <div
      className={cn(
        'scroll-mt-8',
        'col-span-2 flex flex-col gap-3 md:gap-4',
        '@md/section-primary:col-span-1',
        '@md/section-secondary:col-span-1',
      )}
      id={`${type}-palette`}
    >
      {colors.map((c, i) => {
        const isDark = tinycolor(color).isDark()
        const foregroundColor = isDark
          ? 'text-white/0 transition-colors group-hover/pill-btn:text-white/70 group-focus/pill-btn:text-white/70 contrast-more:text-white/80 contrast-more:hover:text-white contrast-more:font-medium'
          : 'text-black/0 transition-colors group-hover/pill-btn:text-black/70 group-focus/pill-btn:text-black/70 contrast-more:text-black/80 contrast-more:hover:text-black contrast-more:font-medium'
        return (
          <button
            aria-label={`Copy ${c} to clipboard`}
            className={cn(
              'group/pill-btn flex h-10 w-full items-center justify-between rounded-full border border-border px-2.5 text-xs transition-colors duration-500 focus:outline-none focus:ring focus:ring-accent focus:ring-opacity-50',
            )}
            key={`${type}-${i}`}
            style={{
              backgroundColor: c.toHexString(),
              transitionDelay: `${0.44 + i * 0.06}s`,
            }}
            type="button"
          >
            <motion.code
              className={cn('animate-text', foregroundColor)}
              key={`${type}-text-${i}`}
            >
              {colorString(c)}
            </motion.code>
            <Copy
              className={cn(
                'h-4 w-4 opacity-0 transition-opacity group-hover/pill-btn:opacity-100 group-focus/pill-btn:opacity-100',
                foregroundColor,
              )}
            />
          </button>
        )
      })}
    </div>
  )
}

export default AnalogousMonochromaticPalettes

'use client'

import { useColorStore } from '@/context/color-store-provider'
import useCopyText from '@/hooks/use-copy-text'
import { colorHelper } from '@/lib/colorHelper'
import { useToolStore } from '@/store/toolStore'
import { BaseColorTypes, RawColor } from '@/types/app'
import { cn } from '@ui/lib/utils'
import { motion } from 'motion/react'
import { Copy } from 'lucide-react'
import { useTheme } from 'next-themes'
import React, { useEffect, useState } from 'react'

const PaletteButton = React.forwardRef<
  HTMLButtonElement,
  { animation: number; step: number; type: BaseColorTypes }
>(({ animation, step, type }, ref) => {
  const { theme } = useTheme()
  const [isChanging, setIsChanging] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const colorPalettes = useColorStore((s) => s.colors.colorPalettes)
  const { colorMode } = useToolStore()
  const { copyText } = useCopyText()
  const color =
    colorPalettes?.[type]?.[step]?.raw || ({ h: 0, l: 0, s: 0 } as RawColor)
  const { h, s } = color
  const shadowSmall = `${h} ${s * 100}% ${theme === 'dark' ? 17 : 73}% `
  const shadowLarge = `${h} ${s * 100}% ${theme === 'dark' ? 10 : 80}% `
  const activeShaodw = `0 4px 14px -2px hsl(${shadowSmall}/var(--shadow-opacity)), 0 12px 24px -2px hsl(${shadowLarge}/var(--shadow-opacity))`
  const colorString = colorHelper.toColorMode(color, colorMode)
  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true)
      return
    }
    setTimeout(
      () => {
        setIsChanging(true)
        setTimeout(
          () => {
            setIsChanging(false)
          },
          100 + animation * 800,
        )
      },
      100 + animation * 800,
    )
  }, [color])
  return (
    <motion.button
      ref={ref}
      aria-label={`Click to copy ${colorString} to clipboard`}
      className={cn(
        'rounded-lg border border-border outline-none',
        'group',
        'transition-shadow duration-300 [--shadow-opacity:0] hover:[--shadow-opacity:0.8] dark:hover:[--shadow-opacity:0.3]',
        'focus-within:[--shadow-opacity:0.8] dark:focus-within:[--shadow-opacity:0.3]',
      )}
      initial={{ scale: 1 }}
      onClick={() => copyText(colorString)}
      style={{
        boxShadow: activeShaodw,
      }}
      title={colorString}
      transition={{
        duration: isChanging ? animation * 1.2 : 0.3,
      }}
      type="button"
      whileFocus={{ scale: 1.05 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={{
          opacity: isChanging ? 0.8 : 1,
        }}
        className={cn(
          'flex h-10 items-center justify-center rounded-[calc(var(--radius)_-_1px)]',
        )}
        initial={{
          opacity: 1,
        }}
        style={{
          backgroundColor: colorHelper.toHex(color),
          transitionDelay: `${animation}s`,
          transitionDuration: `${animation * 1.2}s`,
        }}
      >
        <Copy
          className="h-4 w-4 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
          color={colorHelper.toForeground(color)}
        />
      </motion.div>
    </motion.button>
  )
})

export default PaletteButton

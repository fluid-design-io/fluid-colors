'use client'

import { useColorStore } from '@/context/color-store-provider'
import useCopyText from '@/hooks/use-copy-text'
import { textAnimation } from '@/lib/animation'
import { colorHelper } from '@/lib/colorHelper'
import { useToolStore } from '@/store/toolStore'
import { ColorOptions } from '@/types/app'
import { cn } from '@ui/lib/utils'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { CopyIcon, Palette } from 'lucide-react'
import { useEffect, useState } from 'react'

import ColorPickerModal from './color-picker-modal'

function ColorPicker({
  className,
  type,
}: {
  className?: string
  type: keyof ColorOptions
}) {
  const { colors, setColor } = useColorStore((s) => s)
  const { colorMode } = useToolStore()
  const [isOpen, setIsOpen] = useState(false)
  const [colorString, setColorString] = useState(
    colorHelper.toColorMode(colors.baseColors?.[type], colorMode!),
  )
  const foregroundColor = colorHelper.toForeground(colorString)
  const shouldReduceMotion = useReducedMotion()
  const { copyText } = useCopyText()

  const clearSearchParams = () => {
    const url = new URL(window.location.href)
    // clear primary, secondary, accent
    url.searchParams.delete('primary')
    url.searchParams.delete('secondary')
    url.searchParams.delete('accent')
    window.history.replaceState({}, '', url.toString())
  }
  const animationDelay = () => {
    switch (type) {
      case 'primary':
        return 0
      case 'secondary':
        return 0.06
      case 'accent':
        return 0.18
    }
  }
  useEffect(() => {
    setColorString(
      colorHelper.toColorMode(colors.baseColors?.[type], colorMode!),
    )
  }, [colors.baseColors, colorMode])
  return (
    <AnimatePresence mode="sync">
      <motion.div
        className={cn(
          // general
          'overflow-hidden',
          // min width - horizontal
          'flex aspect-[2.75/1] max-h-44 w-full items-end justify-stretch rounded-2xl border border-border',
          // small - vertical
          '@md/section-primary:aspect-[1/1.618] @md/section-primary:max-h-none @md/section-primary:flex-col-reverse @md/section-primary:items-stretch @md/section-primary:justify-start @md/section-primary:gap-6',
        )}
        key={`color-picker-${type}`}
        layoutId={`color-picker-${type}`}
      >
        <div
          className={cn(
            'p-2',
            // min width
            'min-w-[max(9rem,40%)]',
            // small
            '@md/section-primary:min-w-none @md/section-primary:w-full',
          )}
        >
          <motion.h2
            className="text-start text-sm font-semibold capitalize text-foreground/75 delay-0 @md/section-primary:leading-3 md:text-base"
            layoutId={`color-picker-title-${type}`}
          >
            {type}
          </motion.h2>
          <motion.button
            aria-label={`Click to copy ${type} color`}
            className={cn(
              'group/color-button relative w-full text-start font-comfortaa text-xs tabular-nums text-muted-foreground delay-0',
              'flex items-center justify-between focus:outline-none',
            )}
            layoutId={`color-picker-value-${type}`}
            onClick={() => copyText(colorString)}
            title={`Click to copy ${type} color`}
            type="button"
          >
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                className={cn(
                  'pointer-events-none relative z-10 w-full bg-background transition-colors',
                  'group-hover/color-button:text-foreground group-focus/color-button:text-foreground',
                  'contrast-more:font-medium contrast-more:text-foreground/80 contrast-more:group-hover:text-foreground contrast-more:group-focus:text-foreground',
                )}
                key={`color-picker-value-${colorString}`}
                {...textAnimation(
                  shouldReduceMotion || false,
                  animationDelay(),
                )}
                suppressHydrationWarning
              >
                {colorString}
              </motion.span>
            </AnimatePresence>
            <CopyIcon className="z-10 h-3.5 w-3.5 text-foreground opacity-0 transition-opacity group-hover/color-button:opacity-100 group-focus/color-button:opacity-100" />
            <span
              className={cn(
                'absolute inset-0 z-[9]',
                'group-hover/color-button:bg-background group-focus/color-button:bg-background',
                '-mx-2 -my-2 rounded-[0.9rem] px-2 py-2 transition',
                'ring-inset group-hover/color-button:ring-1 group-hover/color-button:ring-primary group-focus/color-button:ring-1 group-focus/color-button:ring-primary',
              )}
            />
          </motion.button>
        </div>
        <motion.button
          aria-label={`Click to change ${type} color`}
          className={cn(
            'group/picker-button flex flex-col items-center justify-center transition-colors duration-500',
            // mobile
            'h-full flex-grow',
            className,
          )}
          onClick={() => setIsOpen(true)}
          style={{
            backgroundColor: colorString,
          }}
          title={`Click to change ${type} color`}
          type="button"
        >
          <span>
            <Palette
              className={cn(
                'mt-4 h-8 w-8 opacity-0 transition-opacity group-hover/picker-button:opacity-100 group-focus-visible/picker-button:opacity-100',
              )}
              style={{
                color: foregroundColor,
              }}
            />
          </span>
          <span
            className={cn(
              'mt-1 touch-none select-none text-center text-xs opacity-0 transition-opacity delay-0 group-hover/picker-button:opacity-100 group-hover/picker-button:delay-1000 group-focus-visible/picker-button:opacity-100',
            )}
            style={{
              color: foregroundColor,
            }}
          >
            Change {type} color
          </span>
        </motion.button>
      </motion.div>
      {isOpen && (
        <ColorPickerModal
          colorString={colorString}
          onChange={(k, c) => {
            clearSearchParams()
            const hex = colorHelper.toHex(c)
            setColorString(hex)
            setTimeout(() => {
              // delay to throttle color change
              setColor(k, hex)
            }, 550)
          }}
          onClose={() => setIsOpen(false)}
          type={type}
        />
      )}
    </AnimatePresence>
  )
}

export default ColorPicker

'use client'

import { useColorStore } from '@/context/color-store-provider'
import { colorHelper } from '@/lib/colorHelper'
import { ColorMode, ColorOptions } from '@/types/app'
import { cn } from '@ui/lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

import ColorPickerModal from '../palette/color-picker-modal'

const ColorPickerFabButton = ({ type }: { type: keyof ColorOptions }) => {
  const [isOpen, setIsOpen] = useState(false)
  const {
    colors: { baseColors },
    setColor,
  } = useColorStore((s) => s)
  const colorString = colorHelper.toColorMode(baseColors[type], ColorMode.HEX)
  const shadowColor = {
    accent: 'hover:shadow-accent/30',
    primary: 'hover:shadow-primary/30',
    secondary: 'hover:shadow-secondary/30',
  }
  return (
    <AnimatePresence initial={false} mode="sync">
      <motion.button
        animate={{ borderRadius: 48, scale: 1 }}
        className={cn(
          'relative h-12 w-12 shadow-lg transition-shadow hover:shadow-xl',
          shadowColor[type],
        )}
        exit={{ borderRadius: 16, scale: 0.88 }}
        initial={{ borderRadius: 16, scale: 0.88 }}
        key={`color-picker-${type}`}
        layoutId={`color-picker-${type}-fab`}
        onClick={() => setIsOpen(true)}
        transition={{
          bounce: 0.2,
          type: 'spring',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.span
          className={cn(
            'absolute inset-0 rounded-full transition-all',
            'ring-2 ring-inset',
            isOpen
              ? 'ring-transparent'
              : 'ring-white delay-500 duration-1000 dark:ring-white/40',
          )}
          key={`color-picker-${type}-fill`}
          style={{ backgroundColor: colorString }}
        />
        <span className="sr-only">Click to change {type} color</span>
        <motion.div layoutId={`color-picker-value-${type}-fab`} />
      </motion.button>
      {isOpen && (
        <ColorPickerModal
          colorString={colorString}
          onChange={(k, c) => setColor(k, colorHelper.toHex(c))}
          onClose={() => setIsOpen(false)}
          prefix="fab"
          type={type}
        />
      )}
    </AnimatePresence>
  )
}

export default ColorPickerFabButton

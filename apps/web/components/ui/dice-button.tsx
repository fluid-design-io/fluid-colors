'use client'

import { useColorStore } from '@/context/color-store-provider'
import { colorHelper } from '@/lib/colorHelper'
import { generateBaseColors } from '@/lib/generateBaseColors'
import { Button } from '@ui/components/ui/button'
import { cn } from '@ui/lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react'
import { useState } from 'react'

import MobilePrimaryMenu from './mobile-primary-menu'

export const DiceButton = () => {
  const [face, setFace] = useState(0)
  const [faceKey, setFaceKey] = useState(0)
  const [loading, setLoading] = useState(false)
  const setBaseColors = useColorStore((s) => s.setBaseColors)
  const faces = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6]
  const Face = faces[face]

  const roll = () => {
    const newFace = Math.floor(Math.random() * 6)
    setLoading(true)
    setFace(newFace)
    // set a randome faceKey to trigger the animation
    setFaceKey(Math.round(Math.random() * 3000))

    // remove url search params if exists
    const url = window.location.href.split('?')[0]
    window.history.pushState({}, document.title, url)

    // find #palette-body and add a .coloring class
    const paletteBody = document?.getElementById('palette-body')
    if (paletteBody) {
      paletteBody.classList.add('coloring')
    }

    // delay the fetching of new colors
    setTimeout(() => {
      const baseColorsRaw = generateBaseColors()
      setBaseColors({
        accent: colorHelper.toHex(baseColorsRaw.accent),
        primary: colorHelper.toHex(baseColorsRaw.primary),
        secondary: colorHelper.toHex(baseColorsRaw.secondary),
      })

      setTimeout(() => {
        setLoading(false)
        if (paletteBody) {
          paletteBody.classList.remove('coloring')
        }
      }, 700)
    }, 320)
  }
  return (
    <div className="inline-flex">
      <Button
        className={cn(
          'rounded-e-none transition-colors duration-1000 lg:rounded-e-md',
          {
            'pointer-events-none': loading,
          },
        )}
        onClick={roll}
        size="sm"
        title="Roll to generate a new random palette"
      >
        <div className="sr-only">Roll to generate a new random palette</div>
        <AnimatePresence mode="popLayout">
          <motion.div
            className="flex items-center justify-center gap-2"
            key={`dice-button-${faceKey}`}
          >
            <motion.span
              animate={{
                opacity: 1,
                scale: 1,
                transition: { delay: 0.3, duration: 0.7 },
              }}
              exit={{
                opacity: 0,
                scale: 0.8,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              transition={{
                duration: 0.7,
              }}
            >
              <Face className="h-5 w-5" />
            </motion.span>
            <span className="text-sm font-semibold">Generate</span>
          </motion.div>
        </AnimatePresence>
      </Button>
      <MobilePrimaryMenu disabled={loading} />
    </div>
  )
}

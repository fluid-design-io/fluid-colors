import { ColorOptions, RawColor } from '@/types/app'
import { cn } from '@ui/lib/utils'
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { createPortal } from 'react-dom'
import tinycolor from 'tinycolor2'

function ColorPickerModal({
  colorString,
  onChange,
  onClose,
  prefix = '',
  type,
}: {
  colorString: string
  onChange: (newBaseColor: keyof ColorOptions, newColor: RawColor) => void
  onClose: () => void
  prefix?: string
  type: keyof ColorOptions
}) {
  const [_color, setColor] = useState(colorString) // internal state
  const submitRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const validColor = tinycolor(_color).isValid()
    ? tinycolor(_color).toHexString()
    : colorString
  const handleInputChange = (e) => {
    const { value } = e.target
    const color = tinycolor(value)
    if (color.isValid()) {
      setColor(color.getOriginalInput() as string)
    } else {
      setColor(value)
    }
  }
  // listen for escape key
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  const handleColorChange = () => {
    const { a, h, l, s } = tinycolor(_color).toHsl()
    const RawColor = {
      a: Math.round(a * 100) / 100,
      h: Math.round(h * 100) / 100,
      l: Math.round(l * 100) / 100,
      s: Math.round(s * 100) / 100,
    }
    onChange(type, RawColor)
    onClose()
  }

  const inputStyle = {
    accent:
      'selection:bg-accent selection:text-accent-foreground focus:ring-accent',
    primary:
      'selection:bg-primary selection:text-primary-foreground focus:ring-primary',
    secondary:
      'selection:bg-secondary selection:text-secondary-foreground focus:ring-secondary',
  }

  useEffect(() => {
    // listen for escape key
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 250)
  }, [])
  return createPortal(
    <motion.div
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex max-h-[100dvh] w-full items-center justify-center pb-[calc(env(safe-area-inset-bottom)+10vh)] sm:pb-[env(safe-area-inset-bottom)]"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      key={`color-picker-modal-${type}`}
      style={{
        backgroundColor: validColor,
      }}
    >
      <div className="fixed inset-0 h-full w-full" onClick={onClose} />
      <motion.div
        animate={prefix ? { borderRadius: 12 } : {}}
        className={cn(
          'relative flex flex-col gap-4 overflow-hidden border border-border/30 bg-white/75 text-start transition-colors duration-1000 ease-in-out dark:bg-black/75',
          { 'rounded-xl': !prefix },
        )}
        exit={prefix ? { borderRadius: 120 } : {}}
        initial={prefix ? { borderRadius: 120 } : {}}
        layout
        layoutId={`color-picker-${type}${prefix ? '-' + prefix : ''}`}
      >
        <motion.h4
          className="z-[2] px-4 pt-4 font-semibold capitalize text-gray-800 dark:text-gray-100"
          layoutId={`color-picker-title-${type}${prefix ? '-' + prefix : ''}`}
        >
          {type} Color
        </motion.h4>
        <motion.div
          animate={{ opacity: 1, transition: { delay: 0.25 } }}
          className="px-4"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
        >
          <HexColorPicker
            className="!w-full min-w-[12rem]"
            color={validColor}
            onChange={(c) => setColor(c)}
          />
        </motion.div>
        <motion.div className="px-4">
          <form
            className=""
            onSubmit={(e) => {
              e.preventDefault()
              handleInputChange({ target: { value: e.target[0].value } })
            }}
          >
            <motion.input
              className={cn(
                'block w-full rounded-lg border border-border/30 bg-transparent px-2.5 py-1.5 text-sm outline-none focus:ring focus:ring-opacity-50',
                inputStyle[type],
              )}
              id="color"
              layoutId={`color-picker-value-${type}${prefix ? '-' + prefix : ''}`}
              name="color"
              onChange={handleInputChange}
              onFocus={(e) => e.target.select()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  submitRef.current?.click()
                }
              }}
              placeholder="Enter a color"
              ref={inputRef}
              type="text"
              value={_color}
            />
          </form>
        </motion.div>
        <div className="flex">
          <button
            className="block w-full rounded-bl-xl border-r border-t border-r-border/30 border-t-border/30 px-4 py-2 text-foreground transition hocus:bg-border dark:text-gray-100"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="block w-full rounded-br-xl border-t border-t-border/30 px-4 py-2 text-foreground transition hocus:bg-border dark:text-gray-100"
            onClick={handleColorChange}
            ref={submitRef}
          >
            Done
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  )
}

export default ColorPickerModal

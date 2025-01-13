'use client'

import ImageDragAndDrop from '@/components/core/image-drag-and-drop'
import { useColorStore } from '@/context/color-store-provider'
import { useToolStore } from '@/store/toolStore'
import { extractColors } from 'extract-colors'
import { FinalColor } from 'extract-colors/lib/types/Color'
import {
  AnimatePresence,
  motion,
  useAnimation,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react'
import { X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Fragment, memo, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from 'ui/components/ui/button'
import { cn } from 'ui/lib/utils'

function UploadImaagePlugin(props) {
  const {
    imageColorExtractor: { baseColors: imageBaseColors, colors },
    setOpenImageColorExtractor,
    updateImageColorExtractor,
  } = useToolStore() // [primary, secondary, accent]
  const [activeColorIndex, setActiveColorIndex] = useState(0)
  const [preview, setPreview] = useState(null)
  const { setBaseColors, setColor } = useColorStore((s) => s)
  const pathname = usePathname()
  const isRoot = pathname === '/'

  /* Framer bottom sheet */
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [sheetHeight, setSheetHeight] = useState(0)
  const [innerSheetWidth, setInnerSheetWidth] = useState(0)
  const [enableDrag, setEnableDrag] = useState(true)
  const sheetY = useMotionValue(0)
  const sheetYSpring = useSpring(sheetY, {
    bounce: 0.1,
  })
  const sheetRef = useRef(null)
  const scrollAreaRef = useRef(null)
  const controls = useAnimation()
  const PILL_WIDTH = 128
  const isDesktopSize = innerSheetWidth > 640

  const sheetOpacity = useTransform(
    sheetYSpring,
    [sheetHeight / 4, sheetHeight],
    [0.5, 0.7],
  )
  const collapsePreviewOpacity = useTransform(
    sheetYSpring,
    [sheetHeight / 4, sheetHeight],
    [0, isDesktopSize ? 0.55 : 0.4],
  )
  const sheetBackdropBlur = useTransform(
    sheetYSpring,
    [sheetHeight / 4, sheetHeight],
    [72, 12],
  )

  const sheetWidth = useTransform(
    sheetYSpring,
    [0, sheetHeight],
    [innerSheetWidth, PILL_WIDTH],
  )
  const sheetInnerX = useTransform(
    sheetYSpring,
    [0, sheetHeight],
    [0, -innerSheetWidth / 2 + PILL_WIDTH / 2],
  )
  const sheetX = useTransform(
    sheetYSpring,
    [0, sheetHeight],
    [0, isRoot ? 0 : 172],
  )
  const sheetRadius = useTransform(
    sheetYSpring,
    [0, sheetHeight],
    [0, PILL_WIDTH / 5],
  )
  const sheetInnerOpacity = useTransform(
    sheetYSpring,
    [0, sheetHeight / 1.5],
    [1, 0],
  )

  const sheetBgStyle = useMotionTemplate`hsl(var(--background)/${sheetOpacity})`
  const sheetFilterStyle = useMotionTemplate`blur(${sheetBackdropBlur}px) var(--tw-backdrop-brightness) var(--tw-backdrop-saturate)`

  const onCollapse = () => {
    setIsCollapsed(true)
    controls.start('collapse')
    sheetY.set(sheetHeight)
    if (!isRoot) {
      // find #color-picker-fab
      const fab = document?.getElementById('color-picker-fab')
      if (fab) {
        // make it visible and enable pointer events
        fab.style.opacity = '1'
        fab.style.pointerEvents = 'auto'
      }
    }
  }

  const onExpand = () => {
    setIsCollapsed(false)
    controls.start('expand')
    sheetY.set(0)
    if (!isRoot) {
      // find #color-picker-fab
      const fab = document?.getElementById('color-picker-fab')
      if (fab) {
        // make it invisible and disable pointer events
        fab.style.opacity = '0'
        fab.style.pointerEvents = 'none'
      }
    }
  }

  const onHidden = () => {
    controls.start('hidden')
    setTimeout(() => {
      setOpenImageColorExtractor(false)
      updateImageColorExtractor({
        baseColors: [],
        colors: [],
      })
      if (!isRoot) {
        // find #color-picker-fab
        const fab = document?.getElementById('color-picker-fab')
        if (fab) {
          // make it visible and enable pointer events
          fab.style.opacity = '1'
          fab.style.pointerEvents = 'auto'
        }
      }
    }, 700)
  }

  function onDragEnd(event, info) {
    const shouldColappse =
      info.velocity.y > 20 || (info.velocity.y >= 0 && info.point.y > 45)
    if (shouldColappse) {
      onCollapse()
    } else {
      onExpand()
    }
  }

  function onDrag(event, info) {
    // If the modal content is scrollable, we need to get more information.
    if (
      scrollAreaRef?.current?.scrollHeight >
      scrollAreaRef?.current?.clientHeight
    ) {
      // If the modal is already collapsed or if the user has scrolled back to the top,
      // then we can allow the drag event to collapse the modal.
      if (isCollapsed || scrollAreaRef?.current?.scrollTop === 0) {
        const y = info.offset.y
        if (y < 0 && !isCollapsed) {
          setEnableDrag(false)
          return
        }
      }
    } else {
      // If the modal content is not scrollable, then the drag event should be allowed.
      const y = info.offset.y
      if (y < 0 && !isCollapsed) return
      if (y > 0 && isCollapsed) return
      setEnableDrag(true)
      const offset = y < 0 ? sheetHeight + y : y
      sheetYSpring.jump(offset)
    }
  }

  const handleSheetPosition = () => {
    if (isCollapsed) {
      onExpand()
    } else {
      onCollapse()
    }
  }

  useEffect(() => {
    onExpand()
  }, [])

  const calcScreenDimension = () => {
    const h = sheetRef?.current?.offsetHeight
    const w = window.innerWidth
    // isCollapsed && onExpand();
    setSheetHeight(h)
    setInnerSheetWidth(w)
  }
  useEffect(() => {
    window.addEventListener('resize', calcScreenDimension)
    calcScreenDimension()
    return () => window.removeEventListener('resize', calcScreenDimension)
  }, [])

  // recalculate the sheet height when the content changes
  useEffect(() => {
    calcScreenDimension()
  }, [preview])

  // trap focus and lock body when it's expanded
  useEffect(() => {
    if (isCollapsed) return
    const handleFocus = (e) => {
      if (!sheetRef?.current?.contains(e.target)) {
        sheetRef?.current?.focus()
      }
    }
    document.addEventListener('focus', handleFocus, true)
    document.body.style.overflow = 'hidden'
    // document.body.style.pointerEvents = "none";
    return () => {
      document.removeEventListener('focus', handleFocus, true)
      document.body.style.overflow = 'auto'
      // document.body.style.pointerEvents = "auto";
    }
  }, [isCollapsed])

  const handleDropImage = async (files: FileList) => {
    const file = files[0]
    if (!file) return

    if (file.size > 10000000) {
      toast.error('File too large', {
        description: 'Please upload a file less than 10MB',
      })
      return
    }

    let colors = []
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()
      img.src = e.target.result as string
      setPreview(URL.createObjectURL(file))
      img.onload = async () => {
        // <-- This function is already async
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height)

        const extractedColors = await extractColors(data) // <-- Await the Promise
        extractedColors.forEach((color) => {
          // filter out colors that are too
          // muted (< 0.02 saturation), too dark (<0.03 lightness), or too light (>0.97 lightness)
          if (
            color.saturation < 0.02 ||
            color.lightness < 0.03 ||
            color.lightness > 0.97
          )
            return
          colors.push(color)
        })
        // if there are less than 3 colors, add white to the array
        if (colors.length < 3) {
          colors = [...colors, ...Array(3 - colors.length).fill('#fff')]
        }
        setBaseColors({
          accent: colors[2].hex,
          primary: colors[0].hex,
          secondary: colors[1].hex,
        })
        // generatePalette(true)
        updateImageColorExtractor({
          baseColors: colors.slice(0, 3),
          colors: colors.slice(3),
        })
      }
    }

    reader.readAsDataURL(file)
  }

  const handleUpdateNewBaseColor = (c: FinalColor, i: number) => {
    // TODO: update the base color in the store
    setColor(['primary', 'secondary', 'accent'][activeColorIndex], c.hex)

    const prevColors = [...colors]
    prevColors.splice(i, 1)
    prevColors.push(imageBaseColors[activeColorIndex])

    // replace the color with the new one at the same index
    const prevBaseColors = [...imageBaseColors]
    prevBaseColors[activeColorIndex] = c

    updateImageColorExtractor({
      baseColors: prevBaseColors,
      colors: prevColors,
    })

    // set the next color as active
    activeColorIndex === 2
      ? setActiveColorIndex(0)
      : setActiveColorIndex(activeColorIndex + 1)
  }
  return (
    <motion.div
      animate={controls}
      className={cn(
        'pointer-events-auto z-40 mx-auto px-0 pb-12 backdrop-brightness-125 backdrop-saturate-150 dark:backdrop-brightness-75 md:pb-0',
      )}
      drag={enableDrag ? 'y' : false}
      dragConstraints={{ top: 0 }}
      dragElastic={isCollapsed ? 0.2 : 0}
      exit="hidden"
      initial="hidden"
      onDrag={onDrag}
      onDragEnd={onDragEnd}
      // expand if drop enter
      onDragOver={() => isCollapsed && onExpand()}
      ref={sheetRef}
      style={{
        WebkitBackdropFilter: sheetFilterStyle,
        backdropFilter: sheetFilterStyle,
        backgroundColor: sheetBgStyle,
        backgroundImage: `url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAmCAYAAACoPemuAAAACXBIWXMAAAsTAAALEwEAmpwYAAAGF2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgOS4xLWMwMDEgNzkuMTQ2Mjg5OTc3NywgMjAyMy8wNi8yNS0yMzo1NzoxNCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIiB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB0aWZmOk9yaWVudGF0aW9uPSIxIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyMy0xMC0xM1QyMDo1NTo1OC0wNTowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjMtMTAtMTNUMjE6MTk6MTQtMDU6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjMtMTAtMTNUMjE6MTk6MTQtMDU6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmQ3N2M2OWE4LTliZmItNDFlYy1iNmNjLWM2MGE4NTdjZDk2YyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2YmEwNDY2Mi01ZDU2LTQ5MGUtOTU0OS01NjQ3YzIwNDQwN2MiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo2YmEwNDY2Mi01ZDU2LTQ5MGUtOTU0OS01NjQ3YzIwNDQwN2MiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo2YmEwNDY2Mi01ZDU2LTQ5MGUtOTU0OS01NjQ3YzIwNDQwN2MiIHN0RXZ0OndoZW49IjIwMjMtMTAtMTNUMjA6NTY6NTItMDU6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyNS4xICgyMDIzMTAwMy5tLjIzNTAgNDY1NjYxZSkgIChNYWNpbnRvc2gpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpkNzdjNjlhOC05YmZiLTQxZWMtYjZjYy1jNjBhODU3Y2Q5NmMiIHN0RXZ0OndoZW49IjIwMjMtMTAtMTNUMjE6MTk6MTQtMDU6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyNS4xICgyMDIzMTAwMy5tLjIzNTAgNDY1NjYxZSkgIChNYWNpbnRvc2gpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PtN09IQAAApQSURBVFjDPdjHq1VXFAfg/Z7H2HvvvUZN7L2jIoqKigg6UgdiJv4JgmNRQiJOhQwsIGJXNPbe0myx9957iS/3W7C9cHn3nnv2Kr+y9j6v2L59e71du3aVP3z4sGLQoEGpoqIi/ffff+ndu3epXbt26fbt2+ns2bPpxx9/TK9evUp3795NvXr1Sn///Xe6c+dOGjhwYHr+/HkaOnRo2rFjR/r69Wvq0qVLKsVLV69eTZMnT041a9ZMN27ciPubN2+eGjdunKpXr56OHz8eeb777rvUtGnTWFu5cuWyOnXqfC0uXLhQ/uLFi/KRI0dW+OHPP/9MDRo0SJUqVYrkffr0SR06dEjnz5+PZK9fv049evRI5eXlEbxq1appyJAh6enTp+nx48dp4cKFkezJkyff4hw4cCB9/vw5aXzjxo2pVatWcd1f8d6+fZvq1auXHj16lD5+/FiWSq+iVEhF6aYKiLlZcVWqVPnWEYTatm1rQRowYEB837JlS2rTpk3q27dvoHj06NEoetSoUWnv3r1RbN26dSPx/fv3U+vWrQMp8du3bx/ov3z5MmKUQIm3AhXXrFmzdOXKlYqif//+6cGDB+nZs2epe/fuQYsOfvjhhwhagjW+t2jRIn358iWKfPPmTRSSi+7Xr1/6559/osgSFXFf/fr10/Xr10MWTZo0CSY6deoUDLgGUdSi3fVLly7FNU0BoQDz9OnTI8kff/yRSpSma9euBR01atQIndAHGho2bJguX76cJkyYEIs1JFhJDoGC15kzZ1JRFOm3335LPXv2jMJpqGXLloGshrFBCopHP8lAk6Y1496iUaNG0b0bdXbx4sX06dOn9P79+zCCjiSAJK2hYPPmzal3795xb1lZWSSnsX///TeEjsbZs2dHoaNHj06//vpryIMWa9euHW9iR7sm1OAvU3Tu3Dl9+PAhFTjXuWLAWK1ateD63r17AbGAaLaQONELSffr2HfCFlwT2anu2bp1azp9+nTQiwFIMJHPirh161YgSGucLx9GIh+x6+DUqVPhIjD7K/GJEycCja5du4bO6AjNHTt2DOQEgazEikOHbmlo3759QeGhQ4fSuHHjgqKdO3cGUuRB8CRx8+bNyIONkydPBguYKnAssJtq1aqV9uzZE+KlJ0VbiOJ169ZFIehQqAIl81nxkNE9cUOC1riRU+mQiQAgrnGjeA6EjuI1S05MZiYWLE8/KkWf76gVQKEKAP+wYcPiGrohQUfjx4+P7/TF3VBkBC6dNWtWWrZsWXweO3ZsOnfuXNyLag2ij+ghvWjRorRp06aQAMmUBn4qFMEN9COwhapWPUjpAsT0RMjHjh0LumgTCgRvd3AfZ5MBFKCJBWijUPF0R78cDbHff/895ptixAIASq0pVqxYkZYuXRoBdfHXX3/FjXlkcAlKQG1sCCqA4q3xWUMKdo81vgtuaJKKeN40CAD0m4XGFPOIMXHixNAdWUVhthAds73uiZnOQJwnMbQENQoYgKPyy28QR/ORI0fSpEmT4vr+/fujCNOf3iBsFm7bti2KEU9jaObmw4cPRwzxYsCqrrSRR8VeaJsxY0YUKQBKUARNyNEaVDWiUEJmkDxsN2zYELqiQb8rjsPFwIJrkpudKPfZX0UOHjw4CqbHwg2S0RYNQGP16tVp6tSp3+YT/lGxe/fuGKy+sziaBYHIvHnzgkqf6cdOoJj169cHihpcu3ZtONfpBBgol0NOCOdtUR1OF9GFF9uDW/UKAj8DcBEd4B9SKPa7oBBxH0f7blz4a2DaO2385MH5XG4dVpjFiwMZQG4NQzDmGPflMUDc3bp1s7uHaHUMAQFpDffGiiGpa7uC4WnuoReKc+fODfTF0ojfxbOt2YuhSeQkpGC5vcw4RUExEGNjFBCpBL4r0m7PedBQpCCooxcDFEICcJ5EEBkzZkwgaltTdB7M33//fax1nXvRJY6ZqQG0YoFbSUsNBep0pDA/Eigxm1UEb3DSh4C6AzdE0E3wthcoa0QMDjeAFQMB1yCtOe7TjHhyYsQLMIYtWVkjRiE5mFetWhVdLFmyJCytOI7TEVQMPrqB4PDhw0OomvAZvdzknU8rXEljpMAwJANZGnQfBuzL3O+aCaAoKGu4kIxN/QhqRxrFGA2OJYoWBH1TpkyJhBCTiJvoj3ghqQHIolnBBD1ixIhoEmrQMq/okcBp1XUIGjG+Hzx4MNgojAEPEYRK4FyGGp07dfqez+USQgqyBu20adPiVOKwSeT0ZdviOonR7ChDAnkeKtxA5laIapApMgvQpM8CSjShcrqiDXbnHjPHZ06hFduIgqCrcCcK6KIKkgqzjjzEg5jkZp37UTV//vxYgwmbvNecOXPiGmYIn+kKXVmQXQN2+52FEtuIzTkJFU6gCoSEAvylE46GvpkHefdKRqfEbZvjxvz0BWVHKGvz0QuiNGYqFDSCW8HWrFkTyChM926gs/z0pCBUoZVe0AUZCRThDWGO8zJEUc3tWNGcxzfJNeiYA9X8aEinjkvqKGwd3IIic0WheUYZejTmM10QPScKaptxnGESmlIgdIyNfOSmLbphEs37TYMaZiQoQwtLxhaWUOn+wgHNRdW6yWJBvQnT7JEAaoqGmu5/+eWX0KMgaFO8+50WFEMGJGAOakZhhrB4KDdGrIc6STCU0wlJQb3IbqI1EENLsjz1uUlhhp63BizO5jCtucg4kVhRPpt7nMeFXK0xBeanIQBAmXEgqDmjxGyL8xvovCVTnC4ViDr05plDLxwmKVS4zHX6QaWHj/xwC1k6ZQSi5moaJn56yucuDSlSMwAxT7ERiIE8HwK9idHAJGQ3C5afnthecc5dkLKWuOnG0SnvFuK5J48Ocwo69Ixyc9IDCOqhLA8q5f82YHEvqc50Khj6wEqMkOJCL/qQHFqg1znKnKWgRxbLly+PJyNPOs5vZLJ48eLY5vzPw/jhwDwJNEfP3G5caMDfgqtUnjWicvToHPfEnscFqCFqb0SPonSrGUKGksQ6RiMEOE8hthynCMWRgkmQn5IwlJ/KrRU3/kWQhQgpCeiLRrwVRAMQRQFkoAYJBStMc/RiiArK5T///HMgzjAQyI90GtWAnSI/V3hrTgN2FbELyU1vCyxWvVMlt7hu2OkeUvQGAYktzluZeeYZ03DmPP8akICzORIK4ntcU5C3tX43ouLEWkJLfEiak4UtAUUS5tOrQco1OrOAZgTJSOWp7l77G8QIfMGCBXE0MhtnzpwZc4mO6IlxDGuJ6Y8UGCf/j407oS+fNSF+DwyQyv9M47j87JefsPPh0H7qNEIn0CIDaEHVZwnQiVojCCMrV678plt6NoKwoykIQ9Bn8UlGk04XZSXayswfCyAhMNflc5IbJdAEZNHMKPTnXqJWKCcbytAVB02O1rRmI/c7Q3GvPdMA9p2+8gwtSabsp59+KitKnX11oVR5BdQMQMXYMjhUIShwns/ne1rSneLRid58loISCRjOXKcI+lSUghWJFXribgjmf1MBpzQ+yko5v/4PyslGFcA7l4kAAAAASUVORK5CYII=)`,
        backgroundSize: '40px',
        borderRadius: sheetRadius,
        bottom: 0,
        left: 0,
        overflow: 'hidden',
        position: 'fixed',
        right: 0,
        touchAction: 'pan-y',
        width: isDesktopSize ? sheetWidth : '100%',
        x: sheetX,
      }}
      transition={{
        damping: 40,
        stiffness: 400,
        type: 'spring',
      }}
      variants={{
        collapse: {
          y: isDesktopSize ? sheetHeight - PILL_WIDTH / 2 : sheetHeight - 116,
        }, // to encounter the toolbar
        expand: { y: 0 },
        hidden: { y: '100%' },
      }}
      {...props}
    >
      {/* Handle */}
      <button
        className={cn(
          'group absolute inset-x-0 top-0 z-[21] mx-auto h-1 w-12 pt-2 transition-all md:h-1.5',
          !isRoot && isCollapsed && !isDesktopSize && 'left-auto right-8',
          isCollapsed
            ? 'w-32 cursor-pointer pb-16'
            : 'cursor-row-resize pb-1.5',
        )}
        onClick={handleSheetPosition}
        title={isCollapsed ? 'Expand' : 'Collapse'}
        type="button"
      >
        <span
          className={cn(
            'absolute inset-0 top-2 mx-auto h-1 w-12 rounded-full transition-colors sm:h-1.5',
            'group-hover:bg-foreground/50 group-focus:bg-foreground/50',
            'backdrop-blur-md backdrop-brightness-75 transition-opacity',
            isCollapsed ? 'bg-foreground/20' : 'bg-foreground/0',
          )}
        />
        <span className="sr-only">
          Click to {isCollapsed ? 'expand' : 'collapse'} the sheet
        </span>
      </button>
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 z-20 mx-auto bg-background/50"
        style={{
          opacity: collapsePreviewOpacity,
        }}
      >
        {preview && (
          <motion.img
            className="h-full w-full object-cover object-bottom mix-blend-luminosity grayscale-[35%]"
            src={preview}
            style={{
              opacity: collapsePreviewOpacity,
            }}
          />
        )}
      </motion.div>
      <motion.div
        className="flex items-center justify-between"
        style={{
          minWidth: isDesktopSize ? innerSheetWidth : 0,
          opacity: sheetInnerOpacity,
          x: isDesktopSize ? sheetInnerX : 0,
        }}
      >
        <div className="px-6 lg:px-8">
          <h2 className="mt-4 text-lg font-semibold">Upload Image</h2>
          <p className="text-sm text-muted-foreground">
            Upload an image to generate a color palette from it.
          </p>
        </div>
        <Button
          className="md:mr-2"
          onClick={onHidden}
          size="icon"
          variant="ghost"
        >
          <X className="h-4 w-4 text-muted-foreground" strokeWidth={2.5} />
          <span className="sr-only">Close</span>
        </Button>
      </motion.div>
      <motion.div
        className={cn(
          'mt-4 grid gap-4 sm:gap-6 lg:gap-8',
          'max-h-[calc(100dvh-8rem)] overflow-y-auto overflow-x-visible px-4 pb-6 sm:px-6 lg:px-8',
          'w-[calc(100dvw-env(safe-area-inset-right, 0px)-env(safe-area-inset-left, 0px))]',
          !!preview
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1',
        )}
        onScroll={(e) => {
          // enable drag if the user has scrolled back to the top
          if (e.currentTarget.scrollTop <= 10) {
            setEnableDrag(true)
          } else if (e.currentTarget.scrollTop > 10) {
            setEnableDrag(false)
          }
        }}
        ref={scrollAreaRef}
        style={{
          minWidth: isDesktopSize ? innerSheetWidth : 0,
          opacity: sheetInnerOpacity,
          x: isDesktopSize ? sheetInnerX : 0,
        }}
      >
        <div
          className={cn(
            'relative isolate h-[20rem] min-h-64 w-full sm:col-span-2 lg:col-span-1',
          )}
        >
          <AnimatePresence mode="wait">
            {preview && (
              <motion.img
                animate={{ filter: 'blur(0px)', opacity: 1, scale: 1 }}
                className="pointer-events-none absolute inset-0 z-[-2] h-full w-full rounded-md object-cover"
                exit={{ filter: 'blur(8px)', opacity: 0, scale: 0.97 }}
                initial={{ filter: 'blur(8px)', opacity: 0, scale: 0.97 }}
                key={preview}
                src={preview}
              />
            )}
          </AnimatePresence>
          <ImageDragAndDrop
            className="h-full min-h-[16rem] w-full"
            dropAreaStyles={cn(
              'space-y-4',
              preview && [
                'bg-background/70 backdrop-blur-md backdrop-brightness-110 backdrop-saturate-150',
                'absolute bottom-0 inset-x-0 flex justify-center items-center flex flex-row',
                '[&_.drop-icon]:w-6 [&_.drop-icon]:h-6 [&_.drop-icon]:m-0',
                'space-y-0 space-x-2',
              ],
            )}
            onDrop={handleDropImage}
          />
        </div>
        {!!preview && (
          <Fragment>
            <motion.div
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
            >
              <h3 className="text-lg font-semibold">Base Colors</h3>
              <div className="mt-2 flex flex-wrap">
                {imageBaseColors.map((color, index) => (
                  <motion.button
                    className={cn(
                      'mb-2 flex h-12 w-full items-center justify-center',
                      activeColorIndex === index
                        ? 'ring-2 ring-primary ring-offset-2'
                        : 'ring-0',
                    )}
                    key={`${color.hex}-${index}`}
                    layoutId={`color-${color.hex}`}
                    onClick={() => setActiveColorIndex(index)}
                    style={{ backgroundColor: color.hex, borderRadius: 24 }}
                  >
                    <motion.span
                      className={cn(
                        'inline font-mono text-xs',
                        color.lightness < 0.5
                          ? 'text-background'
                          : 'text-foreground',
                      )}
                      layoutId={`color-name-${color.hex}`}
                    >
                      {color.hex}
                    </motion.span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
            <motion.div
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Colors</h3>
                <p className="text-xs text-muted-foreground/70">
                  Click to replace{' '}
                  {['primary', 'secondary', 'accent'][activeColorIndex]} color
                </p>
              </div>

              {!!preview && colors.length === 0 && (
                <div className="mt-2">
                  <p className="text-sm text-foreground/50">
                    There are no colors to display. Upload a new image to get
                    started.
                  </p>
                </div>
              )}
              {colors.length > 0 && (
                <div className="mt-2 grid grid-cols-4 flex-wrap gap-2">
                  {colors.map((color, index) => (
                    <motion.button
                      className="flex h-12 w-full items-center justify-center"
                      key={`${color.hex}`}
                      layoutId={`color-${color.hex}`}
                      onClick={() => handleUpdateNewBaseColor(color, index)}
                      style={{ backgroundColor: color.hex, borderRadius: 8 }}
                    >
                      <motion.span
                        className={cn(
                          'inline font-mono text-xs',
                          color.lightness < 0.5
                            ? 'text-background'
                            : 'text-foreground',
                        )}
                        layoutId={`color-name-${color.hex}`}
                      >
                        {color.hex}
                      </motion.span>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          </Fragment>
        )}
      </motion.div>
    </motion.div>
  )
}

UploadImaagePlugin.displayName = 'UploadImaagePlugin'

export default memo(UploadImaagePlugin)

'use client'

import { motion } from 'motion/react'
import html2canvas from 'html2canvas'
import { DownloadIcon } from 'lucide-react'
import { Fragment, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from 'ui/components/ui/button'
import { Label } from 'ui/components/ui/label'
import { Skeleton } from 'ui/components/ui/skeleton'
import { Switch } from 'ui/components/ui/switch'
import { cn } from 'ui/lib/utils'

type GenerateImageOptions = {
  desktopSize?: boolean
}

function DownloadBasePalettePlugin({
  setOpen,
}: {
  setOpen: (open: boolean) => void
}) {
  const [isLoaded, setisLoaded] = useState(false)
  const [imageData, setImageData] = useState<null | string>(null)
  const [desktopSize, setDesktopSize] = useState<boolean | undefined>(undefined)
  const [isDesktopSize, setIsDesktopSize] = useState(false)
  const handleGenerateImage = (options: GenerateImageOptions) => {
    if (typeof desktopSize === 'undefined') return
    setisLoaded(false)
    const paletteWrap = document?.getElementById('palette')
    if (paletteWrap) {
      // !FIX LINE HEIGHT
      const style = document.createElement('style')
      document.head.appendChild(style)
      style.sheet?.insertRule(
        'body > div:last-child img { display: inline-block; }',
      )
      options.desktopSize &&
        style.sheet?.insertRule('body { min-width: 1920px }')
      html2canvas(paletteWrap, {
        allowTaint: true,
        backgroundColor: null,
        scale: 1,
        useCORS: true,
      }).then((canvas) => {
        const data = canvas.toDataURL('image/png')
        setImageData(data)
        setisLoaded(true)
        // remove the style
        style.remove()
      })
    }
  }
  const handleDownload = () => {
    if (!imageData) return
    const link = document.createElement('a')
    link.download = 'palette.png'
    link.href = imageData
    link.click()
    toast('Image downloaded')
    setOpen(false)
  }

  useEffect(() => {
    if (typeof desktopSize === 'undefined') return
    handleGenerateImage({ desktopSize })
  }, [desktopSize])
  useEffect(() => {
    const calculateSize = () => {
      if (window.innerWidth < 1920) {
        setDesktopSize(false)
        setIsDesktopSize(false)
      } else {
        setDesktopSize(true)
        setIsDesktopSize(true)
      }
    }
    calculateSize()
    window.addEventListener('resize', calculateSize)
    return () => {
      window.removeEventListener('resize', calculateSize)
    }
  }, [])

  return (
    <Fragment>
      <div className="relative w-full">
        <div
          className={cn(
            'mb-4 w-full overflow-hidden rounded-md',
            !isDesktopSize &&
              'aspect-[0.121/1] sm:aspect-[0.339/1] md:aspect-[0.653/1] lg:aspect-[1.82/1]',
            isDesktopSize && 'aspect-[1.82/1]',
          )}
        >
          {isLoaded && imageData ? (
            <motion.img
              alt="Palette preview"
              animate={{ filter: 'blur(0px)', opacity: 1, scale: 1 }}
              className={cn(
                'object-fit absolute inset-0 h-full w-full rounded border',
              )}
              exit={{ filter: 'blur(6px)', opacity: 0, scale: 0.97 }}
              height={184}
              initial={{ filter: 'blur(6px)', opacity: 0, scale: 0.97 }}
              src={imageData}
              width={352}
            />
          ) : (
            <Skeleton className={cn('h-full w-full')} />
          )}
        </div>
      </div>
      <div className="flex justify-between">
        {isDesktopSize !== true ? (
          <div className="flex items-center justify-center space-x-1.5">
            <Switch
              aria-label="Desktop Size"
              checked={desktopSize}
              id="preserve-size"
              onCheckedChange={setDesktopSize}
            />
            <Label className="text-foreground/80" htmlFor="preserve-size">
              Desktop Size
            </Label>
          </div>
        ) : (
          <div />
        )}
        <Button
          className="h-8"
          disabled={!isLoaded}
          onClick={handleDownload}
          size="sm"
        >
          <DownloadIcon className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:ms-2">Download image</span>
        </Button>
      </div>
    </Fragment>
  )
}

export default DownloadBasePalettePlugin

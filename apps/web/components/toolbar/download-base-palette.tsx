'use client'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@ui/components/ui/popover'
import { AnimatePresence } from 'motion/react'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Skeleton } from 'ui/components/ui/skeleton'

import primaryToolbarMenu from '../ui/primary-toolbar-menu'
import ToolbarMenuItem from './toolbar-menu-item'

const DownloadBasePalettePlugin = dynamic(
  () => import('@/components/toolbar/plugin/download-base-palette.plugin'),
  {
    loading: () => (
      <Skeleton className="aspect-[0.121/1] w-full sm:aspect-[0.339/1] md:aspect-[0.653/1] lg:aspect-[1.82/1]" />
    ),
    ssr: false,
  },
)

function ToolbarDownloadBasePalette({ className }: { className?: string }) {
  const menuItem = primaryToolbarMenu.Download
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  if (pathname !== '/') return null
  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger className={className}>
        <ToolbarMenuItem {...menuItem} />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[18rem] sm:w-[28rem]">
        <AnimatePresence mode="wait">
          {open && (
            <DownloadBasePalettePlugin
              key={`download-${open}`}
              setOpen={setOpen}
            />
          )}
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  )
}

export default ToolbarDownloadBasePalette

ToolbarDownloadBasePalette.displayName = 'ToolbarDownloadBasePalette'

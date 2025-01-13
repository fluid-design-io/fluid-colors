'use client'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@ui/components/ui/popover'
import { AnimatePresence } from 'motion/react'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import { Skeleton } from 'ui/components/ui/skeleton'

import primaryToolbarMenu from '../ui/primary-toolbar-menu'
import ToolbarMenuItem from './toolbar-menu-item'

const ShareableLinkPlugin = dynamic(
  () => import('@/components/toolbar/plugin/shareable-link.plugin'),
  {
    loading: () => <Skeleton className="h-56 w-full" />,
    ssr: false,
  },
)

function ToolbarShareableLink({ className }: { className?: string }) {
  const menuItem = primaryToolbarMenu.Share
  const [open, setOpen] = useState(false)
  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger className={className}>
        <ToolbarMenuItem {...menuItem} />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[18rem] sm:w-[28rem]">
        <AnimatePresence mode="wait">
          {open && (
            <ShareableLinkPlugin key={`shareable-${open}`} setOpen={setOpen} />
          )}
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  )
}

export default ToolbarShareableLink

ToolbarShareableLink.displayName = 'ToolbarShareableLink'

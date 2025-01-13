'use client'

import { areSearchParamColorsValid } from '@/lib/colorHelper'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'

function SearchParamsLoadingIndicator(searchParams: {
  accent?: string
  primary?: string
  secondary?: string
}) {
  const { accent, primary, secondary } = searchParams
  const isColorValid = areSearchParamColorsValid(primary, secondary, accent)
  const [loading, setLoading] = useState(isColorValid ? true : false)
  useEffect(() => {
    if (!isColorValid) return
    setTimeout(() => {
      setLoading(false)
    }, 150)
  }, [])
  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed left-0 top-0 z-50 flex h-screen w-screen items-center justify-center bg-background"
          exit={{ opacity: 0, transition: { delay: 0.5 } }}
          initial={{ opacity: 1 }}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="text-primary">Loading</div>
            <div className="flex space-x-2">
              <div className="h-4 w-4 animate-bounce rounded-full bg-primary transition-colors"></div>
              <div className="h-4 w-4 animate-bounce rounded-full bg-secondary transition-colors"></div>
              <div className="h-4 w-4 animate-bounce rounded-full bg-accent transition-colors"></div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SearchParamsLoadingIndicator

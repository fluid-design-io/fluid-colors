'use client'

import { useColorStore } from '@/context/color-store-provider'
import { ColorStep, colorStepMap } from '@/lib/colorStepMap'
import { useToolStore } from '@/store/toolStore'
import { BaseColorTypes } from '@/types/app'
import { Separator } from '@ui/components/ui/separator'
import { cn } from '@ui/lib/utils'
import { AArrowUp, X } from 'lucide-react'
import { useState } from 'react'

import PaletteButton from './base-palette-button'
import ColorString from './color-string'
import ReadabilityString from './readability-string'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@ui/components/ui/popover'

const ReadabilityBadge = ({ score }: { score?: number }) => {
  if (!score) return null
  const eligibleText = `WCAG compliance level ${score >= 7 ? 'AAA' : 'AA'} with a score of ${score}`
  const eligibleConditionalText = `Eligible for WCAG compliance when text size is over 18px bold or 24px regular, with a score of ${score}`
  const ineligibleText = `Ineligible for WCAG compliance with a score of ${score}`
  const badgeClassName = cn(
    ' z-[9] flex w-6 items-center justify-center rounded-full border py-2 text-sm font-semibold text-foreground shadow-lg',
    { 'bg-white dark:bg-zinc-900': score >= 4.5 },
    { 'bg-amber-200 dark:bg-amber-900': score < 4.5 && score >= 3.1 },
    { 'bg-rose-200 dark:bg-rose-950': score < 3.1 },
  )
  return (
    <>
      <div
        className={cn(
          'pointer-events-none absolute inset-y-1.5 -left-3',
          badgeClassName,
        )}
        title={
          score >= 4.5
            ? eligibleText
            : score >= 3.1
              ? eligibleConditionalText
              : ineligibleText
        }
      >
        {score >= 4.5 ? (
          <div className="-translate-y-0.5 tracking-[-0.25rem] text-muted-foreground [text-orientation:upright] [writing-mode:vertical-rl]">
            <span aria-hidden="true">{score >= 7 ? 'AAA' : 'AA'}</span>
            <span className="sr-only">{eligibleText}</span>
          </div>
        ) : score >= 3.1 ? (
          <>
            <AArrowUp className="size-4 text-amber-700 dark:text-amber-200" />
            <span className="sr-only">{eligibleConditionalText}</span>
          </>
        ) : (
          <>
            <X
              className="size-3.5 text-rose-700 dark:text-rose-200"
              strokeWidth={3}
            />
            <span className="sr-only">{ineligibleText}</span>
          </>
        )}
      </div>
      <div className={cn('absolute inset-y-1.5 -right-3', badgeClassName)}>
        <div className="-translate-y-0.5 font-mono tabular-nums text-muted-foreground [writing-mode:vertical-rl]">
          <span
            className={cn(
              'text-xs',
              { 'text-foreground': score >= 4.5 },
              {
                'text-amber-700 dark:text-amber-200':
                  score < 4.5 && score >= 3.1,
              },
              { 'text-rose-700 dark:text-rose-200': score < 3.1 },
            )}
          >
            {score.toFixed(1)}
          </span>
        </div>
      </div>
    </>
  )
}

const PreviewText = ({
  backgroundColor,
  color,
  cursorX = 51,
  index = 0,
}: {
  backgroundColor?: string
  color: string
  cursorX?: number
  index?: number
}) => {
  const shift = 2 // 2% shift
  const clipPathWidth = Math.min(95, Math.max(5, cursorX))
  return (
    <div
      className="absolute inset-0 flex select-none items-center justify-center"
      style={{
        backgroundColor,
        clipPath: backgroundColor
          ? `polygon(0 0, ${clipPathWidth - shift + index * shift * 2}% 0, ${clipPathWidth + shift + index * shift * 2}% 100%, 0 100%)`
          : 'none',
      }}
    >
      <p className="text-shadow px-5 text-center" style={{ color }}>
        The five boxing wizards jump quickly.
      </p>
    </div>
  )
}

function BaseColorPalettes() {
  const { colorPalettes } = useColorStore((s) => s.colors)
  const { colorMode, showReadability } = useToolStore()
  const [cursorX, setCusorX] = useState(51)
  const [cursorY, setCusorY] = useState(50)
  const animation = (i: number, type: BaseColorTypes) => {
    let baseDelay = 0.12
    switch (type) {
      case 'primary':
        baseDelay += 0
        break
      case 'secondary':
        baseDelay += 0.06
        break
      case 'accent':
        baseDelay += 0.12
        break
      case 'gray':
        baseDelay += 0.18
        break
      default:
        baseDelay += 0
        break
    }
    let springDelay = Math.round((Math.pow(1.2, i) - 0.8) * 100) / 100
    return baseDelay + springDelay * 0.06
  }
  const colorPaletteNames: BaseColorTypes[] = [
    'primary',
    'secondary',
    'accent',
    'gray',
  ]
  const handleDragClipPath = (e: React.MouseEvent) => {
    const { clientX, clientY } = e
    const { bottom, left, right, top } = e.currentTarget.getBoundingClientRect()
    const width = right - left
    const cursorX = ((clientX - left) / width) * 100
    const cursorY = ((clientY - top) / (bottom - top)) * 100
    setCusorX(cursorX)
    setCusorY(cursorY)
  }
  return (
    <div className="grid gap-4 @xs/section-secondary:grid-cols-2 @md/section-secondary:grid-cols-4 @2xl/section-secondary:grid-cols-1">
      {colorPaletteNames.map((type: BaseColorTypes) => {
        return (
          <div
            className={cn(
              'grid grid-flow-row grid-cols-1 gap-1.5',
              '@2xl/section-secondary:grid-cols-11',
              'scroll-mt-8',
            )}
            id={`${type}-color-palettes`}
            key={`base-color-palette-${type}`}
          >
            {colorPalettes[type].map((color, i) => {
              const step: ColorStep = i as any
              return (
                <div
                  className="flex flex-col bg-background transition-colors"
                  key={`base-color-palette-${type}-${step}`}
                >
                  <PaletteButton
                    {...{
                      animation: animation(step, type),
                      color,
                      colorMode,
                      step,
                      type,
                    }}
                  />
                  <Popover>
                    <PopoverTrigger
                      title={`Click to view the color contrast comparison`}
                    >
                      <div
                        className={cn(
                          'mt-1.5 flex flex-col items-start justify-start text-xs tabular-nums',
                          '@xs/section-secondary:flex-row @xs/section-secondary:items-center @xs/section-secondary:justify-between',
                          '@md/section-secondary:flex-col @md/section-secondary:items-start @md/section-secondary:justify-start',
                          '@md/section-secondary:min-h-[2.0625rem]',
                        )}
                      >
                        <div className="font-comfortaa font-bold text-foreground/80">
                          {colorStepMap[step]}
                        </div>
                        <div className="relative w-full">
                          <div
                            className={cn(
                              'line-clamp-1 text-end text-muted-foreground/80 transition-colors duration-1000',
                              '@md/section-secondary:w-[-webkit-fill-available] @md/section-secondary:text-start',
                              'hocus:[calc(max(max-content,100%))] hocus:overflow-visible hocus:bg-background hocus:transition-none',
                              'hocus:-mx-1 hocus:-my-0.5 hocus:rounded hocus:px-1 hocus:py-0.5',
                              'hocus:text-muted-foreground hocus:outline-none hocus:ring-1 hocus:ring-inset hocus:ring-border',
                              'contrast-more:font-medium contrast-more:text-foreground/80 contrast-more:hocus:text-foreground',
                              '@md/section-secondary:hocus:absolute @md/section-secondary:hocus:left-0 @md/section-secondary:hocus:top-0 @md/section-secondary:hocus:z-10 @md/section-secondary:hocus:line-clamp-none @md/section-secondary:hocus:shadow-sm',
                            )}
                          >
                            {showReadability ? (
                              <ReadabilityString
                                {...{
                                  animation: animation(step, type),
                                  step,
                                  type,
                                }}
                              />
                            ) : (
                              <ColorString
                                {...{
                                  animation: animation(step, type),
                                  step,
                                  type,
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent
                      className="group/hover-card relative mx-4 flex min-h-[10rem] w-[min(22rem,100svw)] flex-col items-stretch justify-stretch p-0 shadow-2xl"
                      style={{
                        backgroundColor: colorPalettes[type][0]?.color,
                      }}
                    >
                      <div
                        className="absolute inset-x-0 inset-y-0 z-[12] w-full cursor-none"
                        onMouseLeave={() => {
                          setTimeout(() => {
                            setCusorX(51)
                            setCusorY(50)
                          }, 500)
                        }}
                        onMouseMove={handleDragClipPath}
                      >
                        <div
                          className="absolute z-[13] size-2 -translate-x-3 -translate-y-1 rounded-full opacity-0 ring-2 ring-foreground ring-offset-1 ring-offset-background transition-opacity group-hover/hover-card:opacity-100"
                          style={{
                            backgroundColor: colorPalettes[type][step]?.color,
                            left: `${cursorX + 8 * (cursorY / 100)}%`,
                            top: `${cursorY}%`,
                          }}
                        />
                      </div>
                      <div className="relative flex flex-1">
                        <ReadabilityBadge
                          score={color?.readability?.foreground.readability}
                        />
                        <div className="relative w-full flex-1 items-center justify-center overflow-hidden rounded-t-md">
                          <PreviewText
                            color={colorPalettes[type][step]?.color}
                          />

                          <PreviewText
                            backgroundColor={colorPalettes[type][step]?.color}
                            color={colorPalettes[type][0]?.color}
                            cursorX={cursorX}
                          />
                        </div>
                      </div>
                      <Separator
                        style={{
                          backgroundColor: colorPalettes[type][5]?.color,
                          opacity: 0.5,
                        }}
                      />
                      <div
                        className="relative flex flex-1"
                        style={{
                          backgroundColor: colorPalettes[type][10]?.color,
                        }}
                      >
                        <ReadabilityBadge
                          score={color?.readability?.background.readability}
                        />
                        <div className="relative w-full flex-1 items-center justify-center overflow-hidden rounded-b-md">
                          <PreviewText
                            color={colorPalettes[type][step]?.color}
                          />
                          <PreviewText
                            backgroundColor={colorPalettes[type][step]?.color}
                            color={colorPalettes[type][10]?.color}
                            cursorX={cursorX}
                            index={1}
                          />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

export default BaseColorPalettes

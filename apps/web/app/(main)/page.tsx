import { colorHelper } from '@/lib/colorHelper'
import { Metadata, ResolvingMetadata } from 'next'

import ColorPalette from '../../components/palette/color-palette'
import RootSkipNavContent from '../root-skip-nav-content'
import SearchParamsLoadingIndicator from '../search-params-loading-indicator'

type Props = {
  searchParams: { colors: string } | undefined
}

export const dynamic = 'force-dynamic'

export async function generateMetadata(props: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const colors = searchParams?.colors
  let paletteColors = ''
  let opengraphImage = '/og-default.jpg'
  if (colors) {
    const [primary, secondary, accent] = colors.split(',')
    if (primary && secondary && accent) {
      paletteColors = `${primary}, ${secondary}, ${accent}`
    }
    paletteColors = `${colorHelper.toHex(primary)}, ${colorHelper.toHex(secondary)}, ${colorHelper.toHex(accent)}`
    // fetch dynamic og
    const colorsUrl = encodeURIComponent(paletteColors)
    opengraphImage = `${process.env.NEXT_PUBLIC_URL}/api/og?colors=${colorsUrl}`
  }

  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || []
  const seoDescription = colors
    ? `Generated with Fluid Colors: ${paletteColors}`
    : 'Unleash the Power of Dynamic, Variable-Based Color Palettes'
  const ogImages = [opengraphImage, ...previousImages]
  return {
    description: seoDescription,
    openGraph: {
      images: ogImages,
    },
    title: colors ? 'Check out this palette' : 'Color Palette Generator',
    twitter: {
      card: 'summary_large_image',
      description: seoDescription,
      images: ogImages,
      title: colors ? 'Check out this palette' : 'Color Palette Generator',
    },
  }
}
export default async function Page(
  props: {
    searchParams: Promise<{ accent?: string; primary?: string; secondary?: string }>
  }
) {
  const searchParams = await props.searchParams;
  return (
    <div className="site-padding mx-auto flex min-h-[calc(100svh-10.5rem)] w-full max-w-[120rem] flex-1 flex-col justify-center pb-20 sm:pb-24">
      <SearchParamsLoadingIndicator {...searchParams} />
      <RootSkipNavContent />
      <ColorPalette />
    </div>
  )
}

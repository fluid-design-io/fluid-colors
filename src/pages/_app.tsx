import { AppProps } from 'next/app';

import '@/styles/globals.css';

import { AppProvider } from '@/lib/AppContext';

import Layout from '@/components/layout/Layout';
import { SkipNavContent } from '@/components/SkipNavContent';

/**
 * !STARTERCONF info
 * ? `Layout` component is called in every page using `np` snippets. If you have consistent layout across all page, you can add it here too
 */

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AppProvider>
      <SkipNavContent />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AppProvider>
  );
}

export default MyApp;

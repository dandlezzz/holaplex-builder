import React, { ReactElement, ReactNode, useEffect, useMemo } from 'react';
import type { AppProps } from 'next/app';
import 'react-toastify/dist/ReactToastify.css';
import '@/styles/globals.less';
import '@dialectlabs/react-ui/index.css';
import { useRouter } from 'next/router';
import { ToastContainer } from 'react-toastify';
import Head from 'next/head';
import styled from 'styled-components';
import { Layout } from 'antd';
import { isNil } from 'ramda';
import { WalletProviderDeprecated } from '@/modules/wallet';
import { StorefrontProvider } from '@/modules/storefront';
import { AppHeader } from '@/common/components/elements/AppHeader';
import { Close } from '@/common/components/icons/Close';
import { AnalyticsProvider } from '@/common/context/AnalyticsProvider';
import {
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  SolletExtensionWalletAdapter,
  SolletWalletAdapter,
  TorusWalletAdapter,
  GlowWalletAdapter
} from '@solana/wallet-adapter-wallets';
import {
  ConnectionProvider,
  WalletProvider as WalletProviderSolana,
} from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { ApolloProvider, NormalizedCacheObject } from '@apollo/client';

import { QueryClient, QueryClientProvider } from 'react-query';

import '@solana/wallet-adapter-react-ui/styles.css';
import { MarketplaceProvider } from '@/modules/marketplace';
import '@fontsource/material-icons';
import { MultiTransactionProvider } from '@/common/context/MultiTransaction';
import { apolloClient } from 'src/graphql/apollo';
import { NextPage } from 'next';

const { Content } = Layout;

const getSolanaNetwork = () => {
  return (process.env.NEXT_PUBLIC_SOLANA_ENDPOINT ?? '').toLowerCase().includes('devnet')
    ? WalletAdapterNetwork.Devnet
    : WalletAdapterNetwork.Mainnet;
};

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const network = getSolanaNetwork();
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_ENDPOINT!;

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new SlopeWalletAdapter(),
      new TorusWalletAdapter({ params: { network } }),
      new LedgerWalletAdapter(),
      new SolletWalletAdapter({ network }),
      new SolletExtensionWalletAdapter({ network }),
      new GlowWalletAdapter()
    ],
    [network]
  );

  const queryClient = useMemo(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
    []
  );

  const getLayout = Component.getLayout || ((page) => page);

  return (
    <>
      <Head>
        <title>Tools built by creators, for creators, owned by creators | Holaplex</title>
        <meta
          property="description"
          key="description"
          content="Discover, explore, and collect NFTs from incredible creators on Solana. Tools built by creators, for creators, owned by creators."
        />
      </Head>

      <QueryClientProvider client={queryClient}>
        <ToastContainer
          autoClose={5000}
          hideProgressBar={true}
          position={'bottom-center'}
          className="w-full max-w-full font-sans text-sm text-white bottom-4 sm:right-4 sm:left-auto sm:w-96 sm:translate-x-0 "
          toastClassName="bg-gray-900 bg-opacity-80 rounded-lg items-center"
          closeButton={() => <Close color="#fff" />}
        />
        <ApolloProvider client={apolloClient}>
          <ConnectionProvider endpoint={endpoint} config={{ commitment: 'processed' }}>
            <WalletProviderSolana wallets={wallets} autoConnect>
              <WalletModalProvider>
                <WalletProviderDeprecated>
                  {({ wallet }) => (
                    <MultiTransactionProvider>
                      <StorefrontProvider wallet={wallet}>
                        {({}) => {
                          return (
                            <MarketplaceProvider wallet={wallet}>
                              {() => (
                                <AnalyticsProvider>
                                  <AppHeader />
                                  {getLayout(<Component {...pageProps} />)}
                                </AnalyticsProvider>
                              )}
                            </MarketplaceProvider>
                          );
                        }}
                      </StorefrontProvider>
                    </MultiTransactionProvider>
                  )}
                </WalletProviderDeprecated>
              </WalletModalProvider>
            </WalletProviderSolana>
          </ConnectionProvider>
        </ApolloProvider>
      </QueryClientProvider>
    </>
  );
};

export default MyApp;

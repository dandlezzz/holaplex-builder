import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';

import { EmptyStateCTA } from '@/common/components/feed/EmptyStateCTA';
import Footer from '@/common/components/home/Footer';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { HolaButton } from '@/common/components/elements/HolaButton';

const ProfileLanding = () => {
  const anchorWallet = useAnchorWallet();
  const { connecting, publicKey } = useWallet();
  const { setVisible } = useWalletModal();

  const [showConnectCTA, setShowConnectCTA] = useState(false);

  useEffect(() => {
    let timerId: any;
    if (!publicKey) {
      timerId = setTimeout(() => {
        if (!publicKey) {
          setShowConnectCTA(true);
        }
      }, 2000);
    } else {
      setShowConnectCTA(false);
    }

    return () => clearTimeout(timerId);
  }, [publicKey]);

  const router = useRouter();

  if (!showConnectCTA && publicKey) {
    router.push(`/profiles/${publicKey}`);
    return null;
  }

  if (showConnectCTA && !publicKey) {
    return (
      <div className=" -mt-32 h-full max-h-screen">
        <Head>
          <title>Profile | Holaplex</title>
          <meta
            property="description"
            key="description"
            content="Your profile for all things Holaplex and Solana"
          />
        </Head>
        <div className="container mx-auto -mt-12 -mb-80 flex h-full flex-col items-center justify-center px-6 xl:px-44">
          <EmptyStateCTA
            header="Connect your wallet to view your profile"
            body="Follow your favorite collectors and creators, view your nfts, and more..."
          >
            <HolaButton loading={connecting} onClick={() => setVisible(true)}>
              Connect
            </HolaButton>
          </EmptyStateCTA>
        </div>
        <Footer />
      </div>
    );
  }

  return null;
};

export default ProfileLanding;

import React, { useContext, useEffect } from 'react';
import { Modal } from 'antd';
import styled from 'styled-components';
import { useAnalytics } from '@/modules/ganalytics/AnalyticsProvider';
import { WalletContext } from '@/modules/wallet';
import dynamic from 'next/dynamic';
import { holaSignMetadata } from '@/modules/storefront/approve-nft';
import { useScrollBlock } from '@/common/hooks/useScrollBlock';
import { BulkMinter as TBulkMinter } from '@holaplex/ui';
import { Connection } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { isNil } from 'ramda';

const BulkMinter = dynamic(() => import('@holaplex/ui').then((mod) => mod.BulkMinter), {
  ssr: false,
}) as typeof TBulkMinter;

const StyledModal = styled(Modal)`
  margin: 0;
  top: 0;
  padding: 0;
  min-height: 100vh;

  .ant-modal-body {
    padding: 0;
  }

  .ant-modal-content {
    width: 100vw;
    min-height: 100vh;
    overflow-y: scroll;
    margin: 0;
    top: 0;
    background-color: #000;
  }

  .ant-modal-wrap {
    overflow-x: hidden;
  }
`;

interface MintModalProps {
  show: boolean;
  onClose: () => void;
}

const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_ENDPOINT as string);

const MintModal = ({ show, onClose }: MintModalProps) => {
  const { track } = useAnalytics();
  const [blockScroll, allowScroll] = useScrollBlock();
  const { storefront } = useContext(WalletContext);
  const { wallet, signAllTransactions, signTransaction, publicKey, connected} = useWallet();
  
  useEffect(() => {
    if (show) {
      blockScroll();
    } else {
      allowScroll();
    }
  }, [show, blockScroll, allowScroll]);

  if (isNil(wallet) || isNil(wallet.adapter) || wallet?.readyState==="Unsupported" || !connected) {
    return null;
  }

  return (
    <StyledModal
      destroyOnClose
      footer={[]}
      onCancel={onClose}
      visible={show}
      width="100%"
      bodyStyle={{ height: '100%' }}
      closable={false}
      maskStyle={{ overflowX: 'hidden' }}
      wrapProps={{ style: { overflowX: 'hidden' } }}
    >
      <BulkMinter
        wallet={{publicKey, signAllTransactions, signTransaction}}
        track={track}
        storefront={storefront}
        holaSignMetadata={holaSignMetadata}
        onClose={onClose}
        connection={connection}
      />
    </StyledModal>
  );
};
export default MintModal;

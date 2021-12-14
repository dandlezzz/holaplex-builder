import { Storefront } from '@/modules/storefront/types';
import { Skeleton, Card, Row, Image } from 'antd';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { DateTime, Duration } from 'luxon';
import { DemoStorefront } from '@/common/constants/demoContent';
import { ZoomInOutlined } from '@ant-design/icons';

interface Creator {
  address: string;
  verified: boolean;
  share: number;
}

interface Metadata {
  name: string;
  description: string;
  uri: string; // is this the image for the NFT? Assuming it is for now
  creators: Creator[]; // 1st creator - store owner || whitelisted creator ... last creator - holaplex
}

interface Bid {
  canceled: boolean;
  last_amount: number;
  last_changed_at: string; // ISO Date
}

interface Item {
  address: string;
  name: string;
  uri: string;
}

export interface Listing {
  address: string; // assuming this is a unique uri for the auction
  //metadata: Metadata[]; // I don't understand if this is available from the start or not. Assuming it is for now.

  // previewImageURL: string;
  ends_at?: string | null; // ISO Date
  created_at: string; // ISO Date
  ended: boolean;
  last_bid?: number | null; // unix timestamp?
  price_floor?: number | null;
  total_uncancelled_bids?: number | null;
  instant_sale_price?: number | null;
  subdomain: string;
  storeTitle: string;
  items: Item[];
  // storefrontSubdomain: string;
  // storefront?: Storefront;
  // bids: Bid[];
  // demoStoreFront?: DemoStorefront; // for easier demo use
  // ownerAddress: string; // not sure why this is not in the notion spec, but I'm sure Kyle mentioned it
}

const ListingPreviewContainer = styled(Card)`
  width: 100%;
  height: 100%;
  margin-bottom: 96px;

  background: black !important;
  > .ant-card-body {
    padding: 0;
  }
`;

const Square = styled(Row)`
  position: relative;
  flex-basis: calc(33.333% - 10px);
  box-sizing: border-box;
  width: 100%;
  height: 100%;

  margin-bottom: 13px;

  &:before {
    content: '';
    display: block;
    padding-top: 100%;
  }

  > * {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
  }

  > .ant-image-mask {
    cursor: auto !important;
  }
`;

const NFTPreview = styled(Image)`
  object-fit: cover;
  border-radius: 8px;
  width: 100%;
  height: 100%;
`;

const ListingTitle = styled.h3`
  font-size: 18px;
  margin-bottom: 4px;
`;

function calculateTimeLeft(endTime: string) {
  // this is surprisingly performant
  let now = DateTime.local();
  let end = DateTime.fromISO(endTime);

  return Duration.fromObject(end.diff(now).toObject());
}

function Countdown(props: { endTime: string }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(props.endTime));

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft(props.endTime));
    }, 1000);
    // Clear timeout if the component is unmounted
    return () => clearTimeout(timer);
  });

  return <span>{timeLeft.toFormat('hh:mm:ss')}</span>;
}

function AuctionCountdown(props: { endTime: string }) {
  const timeDiffMs = new Date(props.endTime).getTime() - Date.now();
  if (timeDiffMs < 0) return <span></span>;
  const lessThanADay = timeDiffMs < 86400000; // one day in ms

  if (lessThanADay) {
    // only return the "expensive" Countdown component if required
    return <Countdown endTime={props.endTime} />;
  } else {
    // TODO: Cleanup
    const timeLeft = calculateTimeLeft(props.endTime);
    const daysLeft = timeLeft.days;
    console.log('auction ', timeLeft);

    return (
      <span>
        {/* {'in ' + timeLeft.days + ' day'}
        {timeLeft.days > 1 && 's'} */}
        1 day+
      </span>
    );
  }
}

// adds the active loading animation to the antd skeleton image
const StyledSkeletonImage = styled(Skeleton.Image)`
  background: linear-gradient(
    90deg,
    rgba(34, 34, 34, 0.2) 25%,
    rgba(255, 255, 255, 0.16) 37%,
    rgba(34, 34, 34, 0.2) 63%
  );
  background-size: 400% 100%;
  animation: ant-skeleton-loading 1.4s ease infinite;
  border-radius: 8px;
`;

// Going with a full replace of the listing during loading for now, but might revert to swapping individual parts of the component below with its loading state. (as done in a previous commit)
export function SkeletonListing() {
  return (
    <ListingPreviewContainer>
      <Square>
        <StyledSkeletonImage style={{ borderRadius: '8px', width: '100%', height: '100%' }} />
      </Square>
      <Row justify="space-between">
        <Skeleton.Button size={'small'} active />
        <Skeleton.Button size={'small'} active />
      </Row>
      <Row justify="space-between">
        <Skeleton.Button size={'small'} active />
        <Skeleton.Button size={'small'} active />
      </Row>
    </ListingPreviewContainer>
  );
}

const CustomImageMask = styled.div`
  position: absolute;
  right: 0;
  bottom: 0;
  width: 25%;
  height: 25%;
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
`;

const captureCid = /https:\/\/(.*).ipfs.dweb.*$/
const maybeCDN = (uri: string) => (
  uri.replace(captureCid, `${process.env.NEXT_PUBLIC_IPFS_CDN_HOST}/$1`)
)

export function ListingPreview(listing: Listing) {
  const storeHref = `https://${listing?.subdomain}.holaplex.com/#/auction/${listing.address}`;

  const [showArtPreview, setShowArtPreview] = useState(false);
  const [nft, setNFT] = useState<{ [key: string]: any } | null>(null);
  // if (!listing || !listing.subdomain || !listing.address || !listing.items)
  //   return <SkeletonListing />;
  // console.log(listing);
  const nftMetadata = listing?.items?.[0]; // other items are usually tiered auctions or participation nfts
  useEffect(() => {
    async function fetchNFTDataFromIPFS() {
      const res = await fetch(maybeCDN(nftMetadata.uri));
      if (res.ok) {
        const nftJson = await res.json();
        setNFT(nftJson);
      }
    }
    if (nftMetadata?.uri) {
      fetchNFTDataFromIPFS();
    }
  }, [nftMetadata]);

  // shows up to 4 decimals, but removes pointless 0s
  const displayPrice = Number(
    (
      ((listing.price_floor ? listing.price_floor : listing.instant_sale_price) || 0) * 0.000000001
    ).toFixed(4)
  );

  // TODO: revert to adding loading animation for image and title in the real listing
  return (
    <ListingPreviewContainer>
      <Square>
        {!nft?.image ? (
          <StyledSkeletonImage style={{ borderRadius: '8px', width: '100%', height: '100%' }} />
        ) : (
          <NFTPreview
            src={maybeCDN(nft?.image)}
            preview={{
              visible: showArtPreview,
              mask: (
                <CustomImageMask onClick={(e) => setShowArtPreview(true)}>
                  <ZoomInOutlined style={{ fontSize: '1.5rem' }} />
                </CustomImageMask>
              ),
              onVisibleChange: (visible, prevVisible) => {
                console.log('visible', visible);
                console.log('prev visible', prevVisible);
                prevVisible && setShowArtPreview(visible);
              },
              destroyOnClose: true,
            }}
            alt={nftMetadata?.name + ' preview'}
            fallback="data:image/png;base64,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"
          />
        )}
      </Square>
      <Row justify="space-between">
        <ListingTitle className="truncate">{nftMetadata?.name}</ListingTitle>
        <ListingTitle>◎ {displayPrice}</ListingTitle>
      </Row>
      <Row justify="space-between">
        <a href={storeHref} rel="nofollow noreferrer" target="_blank" className="truncate">
          {listing.storeTitle}
        </a>
        {listing.ends_at ? <AuctionCountdown endTime={listing.ends_at} /> : <span>Buy now</span>}
      </Row>
      <style jsx>
        {`
          .truncate {
            width: 10rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        `}
      </style>
    </ListingPreviewContainer>
  );
}

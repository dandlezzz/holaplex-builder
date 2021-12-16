import React, { useContext, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Coingecko, Currency } from '@metaplex/js';
import { WalletContext } from '@/modules/wallet';
import { getFormatedListingPrice, Listing } from '@/common/components/elements/ListingPreview';
import { useRouter } from 'next/router';

export const GOOGLE_ANALYTICS_OLD_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
export const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || 'G-HLNC4C2YKN'; // test id G-HLNC4C2YKN

type GoogleRecommendedEvent = 'login' | 'sign_up' | 'select_content';
type GoogleEcommerceEvent = 'view_item_list' | 'view_item' | 'select_item';

interface AnalyticsUserProperties {
  // user dimensions
  user_id: string; // google reserved
  pubkey: string; // same as user_id, but for use in custom reports
}
interface CustomEventDimensions {
  // event dimensions
  // network: string; // mainnet, devnet, etc.
  // metrics
  sol_value?: number;
}

const listNames = {
  featured_listings: 'Featured listings',
  current_listings: 'Current listings',
};

export function addListingToTrackCall(listing: Listing) {
  return {
    listing_address: listing.listingAddress,
    created_at: listing.createdAt,
    ended: listing.ended,
    highest_bid: listing.highestBid,
    last_bid_time: listing.lastBidTime,
    price: getFormatedListingPrice(listing),
    is_buy_now: !listing.endsAt,
    is_auction: !!listing.endsAt,
    listing_category: !listing.endsAt ? 'buy_now' : 'auction',
    subdomain: listing.subdomain,
  };
}

const AnalyticsContext = React.createContext<{
  configureAnalytics: (options: CustomEventDimensions) => void;
  pageview: (path: string) => void;
  track: (action: string, attributes: { [key: string]: any }) => void;
  trackRecommendedEcommerceEvent: (
    action: GoogleEcommerceEvent,
    listings: Listing[],
    attributes: {
      listId: keyof typeof listNames;
    }
  ) => void;
} | null>(null);

export function AnalyticsProvider(props: { children: React.ReactNode }) {
  let gtag: Gtag.Gtag;
  let solPrice = 0;

  //   const endpointName = ENDPOINTS.find((e) => e.endpoint === endpoint)?.name;
  const { wallet } = useContext(WalletContext);
  const router = useRouter();

  const pubkey = wallet?.pubkey || '';
  // const pubkey = publicKey?.toBase58() || '';

  // moved from _app
  const onRouteChanged = (path: string) => {
    if (GOOGLE_ANALYTICS_OLD_ID && gtag) {
      gtag('config', GOOGLE_ANALYTICS_OLD_ID, { page_path: path });
    }

    // will look into this pageview tracking later
    if (GA4_ID && gtag) {
      window.gtag('event', 'page_view', { page_path: path, send_to: [GA4_ID] });
    }
  };

  useEffect(() => {
    if (!GOOGLE_ANALYTICS_OLD_ID && !GA4_ID) {
      return;
    }

    router.events.on('routeChangeComplete', onRouteChanged);

    return () => {
      router.events.off('routeChangeComplete', onRouteChanged);
    };
  }, [router.events]);

  useEffect(() => {
    gtag = window?.gtag;

    if (!gtag || !GA4_ID) return;

    // const isStoreOwner = ownerAddress === publicKey?.toBase58();
    // user pubkey / id

    setUserProperties({
      user_id: pubkey,
      pubkey: pubkey,
    });
    new Coingecko().getRate([Currency.SOL], Currency.USD).then((rates) => {
      const solRate = rates[0].rate;
      solPrice = solRate;
    });

    // initial config
    configureAnalytics({
      //   network: endpointName,
    });
  }, [
    pubkey,
    // endpointName
  ]);

  function setUserProperties(attributes: AnalyticsUserProperties) {
    gtag('set', 'user_properties', {
      ...attributes,
    });
  }

  function configureAnalytics(options: Partial<CustomEventDimensions>) {
    if (!gtag) return;
    gtag('config', GA4_ID, {
      ...options,
      send_page_view: false,
    });
  }

  function pageview(path: string) {
    // Use this only for virtual pageviews, regular ones we get from
    //  GA4 Enhanced page tracking
    if (!gtag) return;
    track('page_view', {
      path,
    });
  }

  function track(
    action: string,
    attributes: {
      category?: string;
      label?: string;
      value?: number;
      sol_value?: number;
      [key: string]: string | number | any[] | undefined;
    } & Partial<CustomEventDimensions> = {}
  ) {
    const { category, label, sol_value, value, ...otherAttributes } = attributes;
    const attrs = {
      event_category: category,
      event_label: label,
      page_location: window.location.href, // not as useful here as in Metaplex, but probably good to keep for consitency
      ...(sol_value && solPrice
        ? {
            value: sol_value * solPrice, //Google Analytics likes this one in USD :)
            sol_value: sol_value,
          }
        : {
            value,
          }),
      ...otherAttributes,
    };

    console.log('track gtag', !!gtag);
    if (!gtag) {
      setTimeout(() => {
        console.log('track timeout', !!gtag, action, attrs);
        gtag('event', action, attrs);
      }, 500);
    } else {
      console.log('track', gtag, action, attrs);
      gtag('event', action, attrs);
    }
  }

  function addListingsToTrackCall(listings: Listing[], listId: keyof typeof listNames) {
    return listings.map((l, i) => ({
      item_id: l.listingAddress,
      item_name: l.items[0]?.name,
      affiliation: l.subdomain,
      // coupon: "SUMMER_FUN",
      // currency: "USD",
      // discount: 2.22,
      index: i,
      item_list_id: listId,
      // @ts-ignore
      // price: getFormatedListingPrice(l), // inside addListingToTrackCall
      item_list_name: listNames[listId],
      ...addListingToTrackCall(l),
      // location_id: "L_12345",
      // currency: 'SOL',
    }));
    // original google recommened event for comparison
    // gtag('event', action,
    // [
    //   {
    //     item_id: "SKU_12345",
    //     item_name: "Stan and Friends Tee",
    //     affiliation: "Google Store",
    //     coupon: "SUMMER_FUN",
    //     currency: "USD",
    //     discount: 2.22,
    //     index: 5,
    //     item_brand: "Google",
    //     item_category: "Apparel",
    //     item_category2: "Adult",
    //     item_category3: "Shirts",
    //     item_category4: "Crew",
    //     item_category5: "Short sleeve",
    //     item_list_id: "related_products",
    //     item_list_name: "Related Products",
    //     item_variant: "green",
    //     location_id: "L_12345",
    //     price: 9.99,
    //     quantity: 1
    //   }
    // ]
    // });
  }

  // used to track listings as ecommerce items
  function trackRecommendedEcommerceEvent(
    action: GoogleEcommerceEvent,
    listings: Listing[],
    attributes: {
      listId: keyof typeof listNames;
    }
  ) {
    // https://support.google.com/analytics/answer/9267735
    const aggregateSolValue = listings.reduce((acc, l) => acc + getFormatedListingPrice(l), 0);

    switch (action) {
      case 'view_item_list':
        return track(action, {
          item_list_id: attributes.listId,
          item_list_name: listNames[attributes.listId],
          items: addListingsToTrackCall(listings, attributes.listId),
        });
      case 'view_item':
        return track(action, {
          currency: 'USD',
          value: aggregateSolValue * solPrice,
          sol_value: aggregateSolValue,
          items: addListingsToTrackCall(listings, attributes.listId),
        });
      case 'select_item':
        return track(action, {
          item_list_id: attributes.listId,
          item_list_name: listNames[attributes.listId],
          items: addListingsToTrackCall(listings, attributes.listId),
        });
    }
  }

  return (
    <AnalyticsContext.Provider
      value={{
        configureAnalytics,
        track,
        pageview,
        trackRecommendedEcommerceEvent,
      }}
    >
      {props.children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === null) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}

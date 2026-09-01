'use client';
import { useEffect, JSX } from 'react';
import { initContentSdk } from '@sitecore-content-sdk/nextjs';
import { eventsPlugin } from '@sitecore-content-sdk/events';
import { analyticsBrowserAdapter, analyticsPlugin } from '@sitecore-content-sdk/analytics-core';
import { personalizeBrowserPlugin, personalizeBrowserAdapter } from '@sitecore-content-sdk/personalize';
import config from 'sitecore.config';

let sdkReady = false;
const readyCallbacks: Array<() => void> = [];

export function onSdkReady(cb: () => void) {
  if (sdkReady) cb();
  else readyCallbacks.push(cb);
}

const Bootstrap = ({ siteName, isPreviewMode }: {
  siteName: string;
  isPreviewMode: boolean;
}): JSX.Element | null => {
  useEffect(() => {
    const allowDevEvents = process.env.NEXT_PUBLIC_ENABLE_DEV_EVENTS === 'true';
    if (process.env.NODE_ENV === 'development' && !allowDevEvents) {
      console.debug('Browser Events SDK is not initialized in development environment');
      return;
    }
    if (isPreviewMode) {
      console.debug('Browser Events SDK is not initialized in edit and preview modes');
      return;
    }

    if (config.api.edge?.clientContextId) {
      // initContentSdk may be sync or return a promise—handle both
      Promise.resolve(
        initContentSdk({
          config: {
            contextId: config.api.edge.clientContextId,
            edgeUrl: config.api.edge.edgeUrl,
            siteName: siteName || config.defaultSite,
          },
          plugins: [
            analyticsPlugin({
              options: {
                enableCookie: true,
                cookieDomain: window.location.hostname.replace(/^www\./, ''),
              },
              adapter: analyticsBrowserAdapter(),
            }),
            eventsPlugin(),
            personalizeBrowserPlugin({
              options: { enablePersonalizeCookie: true },
              adapter: personalizeBrowserAdapter(),
            }),
          ],
        })
      ).then(() => {
        sdkReady = true;
        readyCallbacks.forEach((cb) => cb());
        readyCallbacks.length = 0;
        console.log('[ContentSDK] initialized ✅');
      });
    } else {
      console.error('Client Edge API settings missing from configuration');
    }
  }, [siteName, isPreviewMode]);

  return null;
};

export default Bootstrap;
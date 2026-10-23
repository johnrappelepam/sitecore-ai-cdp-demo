'use client';
import { useEffect, JSX } from 'react';
import { CdpHelper, useSitecore } from '@sitecore-content-sdk/nextjs';
import { pageView } from '@sitecore-content-sdk/events';
import config from 'sitecore.config';

/**
 * This is the CDP page view component.
 * It uses the Sitecore Cloud SDK to enable page view events on the client-side.
 * See Sitecore Cloud SDK documentation for details.
 * https://www.npmjs.com/package/@sitecore-cloudsdk/events
 */
const CdpPageView = (): JSX.Element => {
  const {
    page: { layout, siteName, mode },
  } = useSitecore();
  const { route, context } = layout.sitecore;

  /**
   * Determines if the page view events should be turned off.
   * IMPORTANT: You should implement based on your cookie consent management solution of choice.
   * By default it is disabled in development mode
   */
  const disabled = () => {
    return process.env.NODE_ENV === 'development';
  };

  useEffect(() => {
    // Do not create events in editing or preview mode or if missing route data
    if (!mode.isNormal || !route?.itemId) {
      return;
    }
    // Do not create events if disabled (e.g. we don't have consent)
    if (disabled()) {
      return;
    }

    const language = route.itemLanguage || config.defaultLanguage;
    const scope = config.personalize?.scope;

    const pageVariantId = CdpHelper.getPageVariantId(
      route.itemId,
      language,
      context.variantId as string,
      scope
    );
    // there can be cases where Events are not initialized which are expected to reject

    const extensionData = {
      pageData: {
        // bad, nested object, will not be flattened
        "category": {
          value: "green"
        },
        // good, flattened to pageData_category_value
        "category_value": "blue",
        
        "boolCheck": true,
        "intCheck": 42,
        "arrayOfObjects": [
          {
            "name": "item1",
            "value": "running"
          },
          {
            "name": "item2",
            "value": "walking"
          },
        ],
        

        // good, flattened to pageData_anatomies
        anatomies: [
          "hip",
          "shoulder",
          "knee",
          "elbow"
        ],
        // good, flattened to pageData_anatomyArea
        anatomyArea: "torso",
        // deep-nesting checks
        "category3": {
          "anotherProp": {
            "value": "red",
            "anotherValue": "orange",
            "anArray": [
              "hip",
              "shoulder",
              "knee",
              "elbow"
            ],
          },
        },
      },
      // good, left as-is
      pageData2_category2_value2: "yellow",
      // good, left as-is
      pageData2_anatomies2: "hip, shoulder, knee, elbow",
      // good, flattened to userData_firstName
      userData: {
        "firstName": "john"
      },
    };
    console.log('Sending page view event with data:');
    pageView({
      channel: 'WEB',
      currency: 'USD',
      page: route.name,
      pageVariantId,
      language,
      extensionData,
    }).catch((e) => console.debug(e));
  }, [mode, route, context.variantId, siteName]);

  return <></>;
};

export default CdpPageView;

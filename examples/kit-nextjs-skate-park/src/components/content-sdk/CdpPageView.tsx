'use client';
import { useEffect, JSX } from 'react';
import { CdpHelper, useSitecore } from '@sitecore-content-sdk/nextjs';
import { pageView } from '@sitecore-content-sdk/events';
import config from 'sitecore.config';
import { NestedObject } from '@sitecore-content-sdk/analytics-core/utils';

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

    const extensionData: NestedObject = {
  pageData: {
    // =========================================================
    // T01: COLLISION PRECEDENCE (explicit key FIRST, nested SECOND)
    // Your first run had nested first, explicit second, and explicit won.
    // If nested wins here, the rule is last-write-wins.
    // If explicit wins again, explicit keys take priority.
    // =========================================================
    t01_value: "T01-explicit-defined-first",
    t01: {
      value: "T01-nested-defined-second",
    },

    // =========================================================
    // T02: THREE-WAY COLLISION
    // All three flatten to pageData_t02_a_b
    // =========================================================
    t02: {
      a: {
        b: "T02-fully-nested",
      },
      a_b: "T02-partial-underscore",
    },
    t02_a: {
      b: "T02-underscore-parent",
    },

    // =========================================================
    // T03: EMPTY VALUES
    // Are these kept or dropped?
    // =========================================================
    t03_emptyObject: {},
    t03_emptyArray: [],
    t03_emptyString: "",
    t03_whitespaceString: "   ",
    t03_nestedEmpty: {
      inner: {},
      sibling: "T03-sibling-of-empty-object",
    },

    // =========================================================
    // T04: FALSY PRIMITIVES AND TYPE PRESERVATION
    // Are falsy values dropped? Are strings coerced?
    // =========================================================
    t04_false: false,
    t04_zero: 0,
    t04_negative: -1,
    t04_float: 3.14159,
    t04_stringTrue: "true",
    t04_stringNumber: "42",

    // =========================================================
    // T05: SPECIAL NUMBERS
    // These are all type `number`, so they compile.
    // NaN and Infinity can come from bad math, e.g. 0/0 or 1/0.
    // =========================================================
    t05_NaN: NaN,
    t05_Infinity: Infinity,
    t05_negativeInfinity: -Infinity,
    t05_unsafeInteger: 9007199254740993, // beyond MAX_SAFE_INTEGER
    t05_scientific: 1e21,

    // =========================================================
    // T06: DEEP NESTING (10 levels)
    // Is there a depth limit?
    // =========================================================
    t06: {
      L2: { L3: { L4: { L5: { L6: { L7: { L8: { L9: { L10: "T06-depth-10" } } } } } } } },
      shallow: "T06-depth-2",
    },

    // =========================================================
    // T07: LONG KEYS AND LONG VALUES
    // Is anything truncated?
    // =========================================================
    t07_longPath: {
      thisIsAVeryLongSegmentNameNumberOneForTesting: {
        thisIsAVeryLongSegmentNameNumberTwoForTesting: {
          thisIsAVeryLongSegmentNameNumberThreeForTesting: "T07-long-path",
        },
      },
    },
    t07_thisIsASingleVeryLongKeyNameThatKeepsGoingAndGoingToTestWhetherThereIsAnyLimitOnTheLengthOfAnIndividualKeyName:
      "T07-long-single-key",
    t07_longValue: "T07-start-" + "x".repeat(5000) + "-T07-end",

        // =========================================================
    // T08: ARRAY VARIATIONS
    // Is anything inside an array ever flattened or altered?
    // Note: the type only allows FLAT objects inside arrays.
    // =========================================================
    t08_nestedArrays: [[1, 2], [3, 4], []],
    t08_mixedTypes: ["T08-string", 42, true, { k: "T08-obj-in-mixed" }],
    t08_arrayOfFlatObjects: [
      { name: "T08-item1", count: 1, active: true },
      { name: "T08-item2", count: 2, active: false },
    ],
    t08_inObject: {
      list: ["T08-a", "T08-b"],
    },

    // =========================================================
    // T09: SPECIAL CHARACTERS IN KEYS
    // Are keys sanitized, encoded, or rejected?
    // Note: JavaScript always lists integer-like keys ("456") first,
    // regardless of where they are written.
    // =========================================================
    t09: {
      "with-dash": "T09-dash",
      "with space": "T09-space",
      "with.dot": "T09-dot",
      "123numericStart": "T09-numeric-start",
      "456": "T09-pure-numeric",
      "ünicodé": "T09-unicode",
      "_leadingUnderscore": "T09-leading-underscore",
      "trailingUnderscore_": "T09-trailing-underscore",
      "double__underscore": "T09-double-underscore",
      "": "T09-empty-key",
      "UPPERCASE": "T09-uppercase",
    },

    // =========================================================
    // T10: SPECIAL CHARACTERS IN VALUES
    // Are values escaped, stripped, or left alone?
    // =========================================================
    t10_quotes: 'T10 "double" and \'single\'',
    t10_newline: "T10-line1\nT10-line2",
    t10_html: "<script>T10</script>",
    t10_emoji: "T10-émoji-🎉",
  },

  // ===========================================================
  // T11: TOP-LEVEL COLLISION (flat key FIRST, nested SECOND)
  // Both flatten to t11Data_x
  // ===========================================================
  t11Data_x: "T11-flat-defined-first",
  t11Data: {
    x: "T11-nested-defined-second",
  },

  // ===========================================================
  // T12: TOP-LEVEL COLLISION (nested FIRST, flat SECOND)
  // Both flatten to t12Data_x
  // ===========================================================
  t12Data: {
    x: "T12-nested-defined-first",
  },
  t12Data_x: "T12-flat-defined-second",

  // ===========================================================
  // T13: FRAMEWORK-RESERVED KEY
  // Does the framework's pageVariantId override this, or the reverse?
  // ===========================================================
  pageVariantId: "T13-my-custom-pageVariantId",

  // ===========================================================
  // T14: TOP-LEVEL NON-OBJECT VALUES
  // Do they behave the same as values inside a container?
  // ===========================================================
  t14_topArray: ["T14-a", "T14-b"],
  t14_topBool: false,
  t14_topNumber: 0,
  t14_topEmptyString: "",
};

// Log the original for side-by-side comparison
console.log("ORIGINAL:", extensionData);
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

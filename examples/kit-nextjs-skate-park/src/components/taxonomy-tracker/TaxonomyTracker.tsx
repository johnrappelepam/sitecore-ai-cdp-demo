// src/components/TaxonomyTracker.tsx
'use client';

import { useEffect, useRef } from 'react';
import { event } from '@sitecore-content-sdk/events';
import { onSdkReady } from '../../Bootstrap'; // adjust path

type TaxonomyTrackerProps = {
  page: any; // replace with your typed layout data
};

// Normalizes GUIDs so "{0B0C...}" and "0b0c..." compare equal
const normalizeId = (id?: string) =>
  id?.replace(/[{}]/g, '').toLowerCase() ?? '';

export default function TaxonomyTracker({ page }: TaxonomyTrackerProps) {
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    const route = page?.layout?.sitecore?.route;
    const taxContentType = route?.fields?.taxContentType;

    if (!taxContentType?.id) return;

    // --- Duplicate guard (App Router keeps layouts mounted across SPA nav) ---
    const routeKey = route?.itemId ?? route?.name ?? taxContentType.id;
    if (lastTracked.current === routeKey) return;
    lastTracked.current = routeKey;

    const eventData: any = {
      type: 'TAXONOMY_VIEWED', // adjust prefix/name to your site
      channel: 'WEB',
      language: 'EN',
      page: route?.name ?? 'unknown',
      extensionData: {
        Taxonomy: taxContentType.id, 
      },
    };

    event(eventData);
  }, [page]);

  return null;
}
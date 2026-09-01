// src/components/content-listing/ContentTypeListing.tsx
import { Page } from '@sitecore-content-sdk/nextjs';
import Link from 'next/link';
import { getContentGraphQlClient } from '../../utils/graphQlClient';

const PAGE_TEMPLATE_ID = '{8690F305-0648-4EB7-B1C9-8112302999AE}';

const CONTENT_BY_TYPE_QUERY = /* GraphQL */ `
  query ContentByType($typeId: String!, $language: String!, $templateId: String!, $pageSize: Int = 50) {
    search(
      where: {
        AND: [
          { name: "taxContentType", value: $typeId, operator: CONTAINS }
          { name: "_language", value: $language, operator: EQ }
          { name: "_templates", value: $templateId, operator: CONTAINS }
        ]
      }
      first: $pageSize
    ) {
      total
      results {
        id
        name
        url { path }
        pageTitle: field(name: "pageTitle") { value }
      }
    }
  }
`;

type ResultItem = {
  id: string;
  name: string;
  url: { path: string };
  pageTitle?: { value: string } | null;
};

type SearchResponse = {
  search: { total: number; results: ResultItem[] };
};

// Edge search index stores GUIDs uppercase, no braces, no dashes
const toEdgeId = (id: string) => id.replace(/[{}-]/g, '').toUpperCase();

interface ContentTypeListingProps {
  page: Page;
}

export default async function ContentTypeListing({ page }: ContentTypeListingProps) {
  const route = page?.layout?.sitecore?.route;
  const taxContentType = route?.fields?.taxContentType as
    | { id: string; name: string }
    | undefined;

  // No content type tagged → render nothing (safe default in editor too)
  if (!taxContentType?.id) {
    return null;
  }

  const language = 'en';
  const currentItemId = route?.itemId ?? '';

  let results: ResultItem[] = [];

  try {
    const client = getContentGraphQlClient();
    
    const data = await client.request<SearchResponse>(CONTENT_BY_TYPE_QUERY, {
      typeId: toEdgeId(taxContentType.id),
      language,
      templateId: toEdgeId(PAGE_TEMPLATE_ID),
      pageSize: 50,
    });

    results = (data?.search?.results ?? []).filter(
      (r) => toEdgeId(r.id) !== toEdgeId(currentItemId)
    );
  } catch (err) {
    console.error('[ContentTypeListing] GraphQL query failed:', err);
    return null; // fail gracefully in the demo
  }

  if (results.length === 0) {
    return (
      <section className="content-type-listing">
        <p>No other {taxContentType.name} content found.</p>
      </section>
    );
  }

  return (
    <section className="content-type-listing">
      <h2>{taxContentType.name} Content</h2>
      <ul>
        {results.map((item) => (
          <li key={item.id}>
            <Link href={item.url.path}>
              {item.pageTitle?.value || item.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
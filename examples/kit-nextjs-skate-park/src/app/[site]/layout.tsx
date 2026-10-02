import { draftMode } from 'next/headers';
import Bootstrap from 'src/Bootstrap';
import CrossSiteLinkDecorator from 'src/CrossSiteLinkDecorator';

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ site: string }>;
}) {
  const { site } = await params;
  const { isEnabled } = await draftMode();

  return (
    <>
      <Bootstrap siteName={site} isPreviewMode={isEnabled} />
      <CrossSiteLinkDecorator />
      {children}
    </>
  );
}

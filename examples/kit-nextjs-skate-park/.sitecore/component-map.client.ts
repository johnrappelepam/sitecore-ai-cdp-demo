// Client-safe component map for App Router
import { NextjsContentSdkComponent } from '@sitecore-content-sdk/nextjs';


import { BYOCClientWrapper, FEaaSClientWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

// end of built-in import section
import * as TaxonomyTracker from 'src/components/taxonomy-tracker/TaxonomyTracker';
import * as Navigation from 'src/components/navigation/Navigation';
import * as MicrositeEmbed from 'src/components/microsite-embed/MicrositeEmbed';
import * as IdentifierTextBox from 'src/components/identifier-text-box/IdentifierTextBox';
import * as ContentBlock from 'src/components/content-block/ContentBlock';

export const componentMap = new Map<string, NextjsContentSdkComponent>([
  ['BYOCWrapper', BYOCClientWrapper],
  ['FEaaSWrapper', FEaaSClientWrapper],
  ['Form', Form],
  ['TaxonomyTracker', { ...TaxonomyTracker }],
  ['Navigation', { ...Navigation }],
  ['MicrositeEmbed', { ...MicrositeEmbed }],
  ['IdentifierTextBox', { ...IdentifierTextBox }],
  ['ContentBlock', { ...ContentBlock }],
]);

export default componentMap;

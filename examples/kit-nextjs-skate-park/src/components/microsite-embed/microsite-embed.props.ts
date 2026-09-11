import { ComponentParams, ComponentRendering, Field } from '@sitecore-content-sdk/nextjs';

export interface MicrositeFields {
  Microsite: Field<string>;
}

export interface MicrositeEmbedProps {
  rendering: ComponentRendering & { params: ComponentParams };
  params: ComponentParams;
  fields: MicrositeFields;
}
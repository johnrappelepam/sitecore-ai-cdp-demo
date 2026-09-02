import { NextRequest } from 'next/server';
import { PersonalizeProxy } from '@sitecore-content-sdk/nextjs/proxy';
import type { PersonalizeInfo } from '@sitecore-content-sdk/content/personalize';

/**
 * DEMO-ONLY WORKAROUND
 * The Content SDK (2.3.0) sends a wildcard friendlyId (`..._en*`) that the
 * Personalize backend does not resolve, causing a 404. The backend expects
 * the exact timestamped friendlyId. We map the wildcard -> real friendlyId here.
 *
 * NOTE: Update these values if the experience is recreated (timestamp changes).
 */
// Map by the base (wildcard-stripped) key so minor language/suffix variations still hit
const FRIENDLY_ID_OVERRIDES: Record<string, string> = {
  'component_8d8273b4a59646a3b54354c726e67c04_bbe1894850c6441dac350f0fc7741cc6_en':
    'component_8d8273b4a59646a3b54354c726e67c04_bbe1894850c6441dac350f0fc7741cc6_en_20260902t153019869z',

    'component_8d8273b4a59646a3b54354c726e67c04_8eb68fc6db344abca99b0e0a45c28ac6_en*':
    'component_8d8273b4a59646a3b54354c726e67c04_8eb68fc6db344abca99b0e0a45c28ac6_en_20260902t192235103z',
};



function resolveFriendlyId(friendlyId: string): string {
  // strip a trailing wildcard if present
  const base = friendlyId.endsWith('*') ? friendlyId.slice(0, -1) : friendlyId;

  if (FRIENDLY_ID_OVERRIDES[base]) {
    return FRIENDLY_ID_OVERRIDES[base];
  }
  return friendlyId;
}

export class DemoPersonalizeProxy extends PersonalizeProxy {
  protected getPersonalizeExecutions(
    personalizeInfo: PersonalizeInfo,
    language: string
  ) {
    const executions = super.getPersonalizeExecutions(personalizeInfo, language);

    return executions.map((exec) => ({
      ...exec,
      friendlyId: resolveFriendlyId(exec.friendlyId),
    }));
  }
}
import { PersonalizeProxy } from '@sitecore-content-sdk/nextjs/proxy';
import type { PersonalizeInfo } from '@sitecore-content-sdk/content/personalize';

export class DemoPersonalizeProxy extends PersonalizeProxy {
  protected getPersonalizeExecutions(
    personalizeInfo: PersonalizeInfo,
    language: string
  ) {
    const executions = super.getPersonalizeExecutions(personalizeInfo, language);

    return executions.map((exec) => ({
      ...exec,
    }));
  }
}
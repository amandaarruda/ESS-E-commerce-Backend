import { recoverPasswordCss } from '../css/recover-password';
import { baseProcessor } from './base-processor';

export const recoverTemplateDataBind = (
  templateBody: string,
  data: {
    name: string;
    link: string;
  },
): string => {
  let template = baseProcessor(templateBody);
  template = template.replace('{{CSS}}', recoverPasswordCss);
  template = template.replace(/{{userName}}/g, data.name);
  template = template.replace('{{link}}', data.link);

  return template;
};

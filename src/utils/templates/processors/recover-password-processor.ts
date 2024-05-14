import { recoverPasswordCss } from '../css/recover-password';
import { baseProcessor } from './base-processor';

const emailImageUrl =
  'https://upload.wikimedia.org/wikipedia/commons/9/96/Google_web_search.png';

export const recoverTemplateDataBind = (
  templateBody: string,
  data: {
    name: string;
    link: string;
  },
): string => {
  let template = baseProcessor(templateBody);
  template = template.replace('{{CSS}}', recoverPasswordCss);
  template = template.replace('{{EMAIL_IMAGE}}', emailImageUrl);
  template = template.replace(/{{userName}}/g, data.name);
  template = template.replace(/{{link}}/g, data.link);

  return template;
};

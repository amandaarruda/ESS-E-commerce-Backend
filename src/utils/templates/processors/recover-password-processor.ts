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
  console.log(template);
  template = template.replace('{{CSS}}', recoverPasswordCss);
  console.log('2', template);
  template = template.replace(/{{userName}}/g, data.name);
  console.log('3', template);
  template = template.replace('{{link}}', data.link);
  console.log('4', template);

  return template;
};

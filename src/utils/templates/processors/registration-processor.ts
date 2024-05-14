import { registrationCss } from '../css/registration';
import { baseProcessor } from './base-processor';

const emailImageUrl =
  'https://upload.wikimedia.org/wikipedia/commons/9/96/Google_web_search.png';

export const registrationTemplateDataBind = (
  templateBody: string,
  data: {
    name: string;
    link: string;
    generatedPassword?: string;
  },
): string => {
  let template = baseProcessor(templateBody);
  template = template.replace('{{CSS}}', registrationCss);
  template = template.replace('{{EMAIL_IMAGE}}', emailImageUrl);
  template = template.replace(/{{userName}}/g, data.name);
  template = template.replace(/{{link}}/g, data.link);

  if (data.generatedPassword) {
    template = template.replace(
      '{{PASSWORD_ADMIN}}',
      `<div class="your-password">
          <h4 class="full-width">{{${data.generatedPassword}}}</h4>
      </div>`,
    );
  }

  return template;
};

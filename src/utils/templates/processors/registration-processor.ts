import { registrationCss } from '../css/registration';
import { baseProcessor } from './base-processor';

const emailImageUrl =
  'https://upload.wikimedia.org/wikipedia/commons/9/96/Google_web_search.png';

/**
 * Processes a registration email template by replacing placeholders with actual data.
 *
 * This function takes a template for an email body and a data object containing user-specific
 * information. It replaces placeholders in the template (such as '{{name}}', '{{email}}',
 * '{{link}}') with the corresponding values from the data object. The
 * placeholders are assumed to be formatted in double curly braces. The function does not
 * return anything as it modifies the templateBody argument directly.
 *
 * @param {string} templateBody - The email template body containing placeholders.
 * @param {object} data - An object containing user-specific data.
 * @param {string} data.name - The user's name to be inserted into the template.
 * @param {string} data.generatedPassword - The generated password to be inserted into the template.
 * @param {string} data.link - A link to be inserted into the template, typically for account activation or similar purposes.
 * @returns {string} The processed template body.
 */
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

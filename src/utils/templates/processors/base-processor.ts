import { baseCss } from '../css/base';

export const baseProcessor = (html: string): string => {
  return html.replace('{{BASE_CSS}}', baseCss);
};

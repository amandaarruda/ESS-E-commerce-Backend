export const isTestEnviroment = (): boolean =>
  process.env.ENV?.toUpperCase() == 'TEST';

export const isDevelopmentEnviroment = (): boolean =>
  process.env.ENV?.toUpperCase() == 'DEV';

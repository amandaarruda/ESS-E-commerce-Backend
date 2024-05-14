export const isTestEnviroment = (): boolean =>
  process.env.ENV?.toUpperCase() == 'TEST';

export const isDevelopmentEnviroment = (): boolean =>
  process.env.ENV?.toUpperCase() == 'DEV';

export const isHomologationEnvironment = (): boolean =>
  process.env.ENV?.toUpperCase() == 'HOMOLOG';

export const isProductionEnviroment = (): boolean =>
  process.env.ENV?.toUpperCase() == 'PROD';

export const enabledMultipleLogin = (): boolean =>
  process.env.MULTIPLE_LOGIN?.toUpperCase() == 'TRUE';

export const deactivateRequiredIpsInRequest = (): boolean =>
  process.env.DEACTIVATE_REQUIRED_IPS_IN_REQUEST?.toUpperCase() == 'TRUE';

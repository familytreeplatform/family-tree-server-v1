export const generateJoinLink = (familyUserName: string, state: string) => {
  const baseUrl = process.env.APP_BASE_DOMAIN;

  return `${baseUrl}?familyName=${familyUserName}&state=${state}`;
};

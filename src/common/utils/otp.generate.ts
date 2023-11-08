import { randomInt } from 'crypto';

export const getRandomDigits = (len: number) => {
  if (len < 1 || len > 10) {
    throw new Error('length must be between 1 and 10');
  }

  const min = 10 ** (len - 1);
  const max = 10 ** len - 1;
  return String(randomInt(min, max));
};

import generator from 'generate-password-ts';

export const generatePassword = (length = 12): string => {
  const password = generator.generate({
    length,
    numbers: true,
    lowercase: true,
    uppercase: true,
  });

  return password.trim();
};

// hash.util.ts
import bcrypt from 'bcrypt';

export const hashClientSecret = async (
  clientSecret: string,
): Promise<string> => {
  //const saltRounds = 10;
  const fixedSalt = '$2b$10$abcdefghijklmnopqrstuv'; 
  return bcrypt.hash(clientSecret, fixedSalt);
};

export const isClientSecretMatch = async (
  clientSecret: string,
  hash: string,
): Promise<boolean> => {
  return bcrypt.compare(clientSecret, hash);
};

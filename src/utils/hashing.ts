import { hash, compare, genSalt } from 'bcryptjs';

const hashPassword = async (plainTextPassword: string): Promise<string> => {
  const salt = await genSalt(10);
  return await hash(plainTextPassword, salt);
};

const comparePassword = async (
  plainTextPassword: string,
  hashedPassword: string,
): Promise<boolean> => {
  return compare(plainTextPassword, hashedPassword);
};

export { hashPassword, comparePassword };

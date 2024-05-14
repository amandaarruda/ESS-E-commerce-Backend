import * as bcrypt from 'bcrypt';

export const hashData = async (data: string): Promise<string> => {
  return await bcrypt.hash(data, 10);
};

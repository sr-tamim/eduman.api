import { Request } from 'express';
import User from 'src/models/user.entity';

export const userIsAdmin = (role: User['role']) => role === 'admin';

export const getUser = (req: Request) => {
  return (req['user'] || null) as User | null;
};

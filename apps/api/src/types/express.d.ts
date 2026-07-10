import { User } from '@lumora/shared';

declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
    id: string;
  }
}

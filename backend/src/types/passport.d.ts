// Override Passport's User type to match our custom user structure
// This file must be loaded BEFORE @types/passport to override the type definition

import * as passport from 'passport';

declare module 'passport' {
  interface User {
    id?: string;
    email?: string;
  }
}

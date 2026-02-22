declare module 'passport-jwt' {
  import { Request } from 'express';

  export interface StrategyOptions {
    jwtFromRequest: (req: Request) => string | null;
    secretOrKey: string | Buffer;
    issuer?: string;
    audience?: string;
    algorithms?: string[];
    ignoreExpiration?: boolean;
    passReqToCallback?: boolean;
  }

  export interface VerifiedCallback {
    (err: Error | null, user?: object, info?: object): void;
  }

  export class Strategy {
    constructor(options: StrategyOptions, verify: (payload: any, done: VerifiedCallback) => void);
    name: string;
  }

  export const ExtractJwt: {
    fromAuthHeaderAsBearerToken(): (req: Request) => string | null;
    fromHeader(header_name: string): (req: Request) => string | null;
    fromBodyField(field_name: string): (req: Request) => string | null;
    fromAuthHeaderWithScheme(auth_scheme: string): (req: Request) => string | null;
    fromUrlQueryParameter(param_name: string): (req: Request) => string | null;
  };
}

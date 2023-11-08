type JwtPayload = {
  id: number;
};

declare namespace Express {
  export interface Request {
    user?: any;
  }
}

type EmailConfirmationPayload = {
  sub: string;
  usub: string;
  flag: string;
};

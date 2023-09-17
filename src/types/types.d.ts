type JwtPayload = {
  id: number;
};

declare namespace Express {
  export interface Request {
    user?: any;
  }
}

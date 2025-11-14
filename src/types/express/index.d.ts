export {};

export interface CustomJwtPayload {
  id: number;
  email: string;
  name: string;
  role: string;
  iat?: number; 
  exp?: number; 
}

declare global {
  namespace Express {
    interface Request {
      user?: CustomJwtPayload;
    }
  }
}
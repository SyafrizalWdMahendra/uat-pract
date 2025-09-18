// Isi dari file: src/types/express/index.d.ts

import { JwtPayload } from "jsonwebtoken";

// Definisikan bentuk payload token Anda di sini
export interface CustomJwtPayload extends JwtPayload {
  id: number;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: CustomJwtPayload;
    }
  }
}

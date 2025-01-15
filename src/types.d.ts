import { Request } from "express";

declare global {
  namespace Express {
    interface User {
      id: string;
      role: string;
    }

    interface Request {
      user?: User; // Mark it optional if it might not always be present
    }
  }
}

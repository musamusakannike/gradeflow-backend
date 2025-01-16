import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface User {
      id: string;
      role: string;
    }

    interface Request {
      user?: JwtPayload & { id: string; role: string }; // Mark it optional if it might not always be present
    }
  }
}

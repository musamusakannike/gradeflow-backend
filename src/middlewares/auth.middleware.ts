import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// Define the shape of the decoded token
interface DecodedToken extends JwtPayload {
  id: string;
  role: string;
  [key: string]: any; // Allows for additional properties
}

// Middleware to authenticate and authorize users
const authenticate =
  (roles: string | string[] = []): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): void => {
    // Ensure roles is an array
    if (typeof roles === "string") {
      roles = [roles];
    }

    // Extract the token from headers
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      res.status(401).json({
        status: "error",
        message: "Access token is missing",
        data: null,
      });
      return; // Stop further execution
    }

    try {
      // Verify the token
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error("JWT_SECRET is not defined in environment variables");
      }

      const decoded = jwt.verify(token, secret) as DecodedToken;
      req.user = decoded; // Attach the decoded token to the request

      // Check for role authorization
      if (roles.length > 0 && !roles.includes(decoded.role)) {
        res.status(403).json({
          status: "error",
          message: "Forbidden: You do not have the required permissions",
          data: null,
        });
        return; // Stop further execution
      }

      // Proceed to the next middleware or route handler
      next();
    } catch (err) {
      res.status(401).json({
        status: "error",
        message: "Invalid or expired token",
        data: null,
      });
      return; // Stop further execution
    }
  };

export { authenticate };

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Middleware to authenticate and authorize users
const authenticate = (roles = []) => (req, res, next) => {
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
        const decoded = jsonwebtoken_1.default.verify(token, secret);
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
    }
    catch (err) {
        res.status(401).json({
            status: "error",
            message: "Invalid or expired token",
            data: null,
        });
        return; // Stop further execution
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=auth.middleware.js.map
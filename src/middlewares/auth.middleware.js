const jwt = require("jsonwebtoken");

// Middleware to authenticate and authorize users
const authenticate =
  (roles = []) =>
  (req, res, next) => {
    // Ensure roles is an array, even if it's a single role
    if (typeof roles === "string") {
      roles = [roles];
    }

    // Extract the token from headers
    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({
          status: "error",
          message: "Access token is missing",
          data: null,
        });
    }

    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Attach the decoded token data to the request object

      // Check for role authorization
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({
          status: "error",
          message: "Forbidden: You do not have the required permissions",
          data: null,
        });
      }

      next(); // User is authenticated and authorized
    } catch (err) {
      return res
        .status(401)
        .json({
          status: "error",
          message: "Invalid or expired token",
          data: null,
        });
    }
  };

module.exports = { authenticate };

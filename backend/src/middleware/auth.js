const { verifyAccessToken } = require("../utils/jwt");
const prisma = require("../config/prisma");

/**
 * Protects a route: requires a valid Bearer access token.
 * Attaches the authenticated user (minus password) to req.user.
 */
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized. No token provided." });
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Access token expired." });
      }
      return res.status(401).json({ error: "Invalid token." });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user || !user.isActive) {
      return res.status(401).json({ error: "User not found or inactive." });
    }

    delete user.password;
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireAuth };

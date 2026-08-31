/**
 * Usage: requireRole("ADMIN", "OFFICER")
 * Must run AFTER requireAuth so req.user is populated.
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized." });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden. Requires role: ${allowedRoles.join(" or ")}.`,
      });
    }
    next();
  };
}

module.exports = { requireRole };

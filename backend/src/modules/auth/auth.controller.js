const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const prisma = require("../../config/prisma");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../../utils/jwt");

// Simple, standard email format check. Not exhaustive RFC 5322 validation,
// but catches the common "invalid email" cases (missing @, no domain, etc).
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/auth/register/
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, language, ward } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "name, email and password are required." });
  }
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "Email is already registered." });
  }

  // Only CITIZEN can self-register through the public endpoint.
  // WORKER / OFFICER / ADMIN accounts should be created by an admin.
  const safeRole = role === "CITIZEN" ? "CITIZEN" : "CITIZEN";

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      password: hashed,
      role: safeRole,
      language,
      ward,
    },
  });

  const access = signAccessToken(user);
  const refresh = signRefreshToken(user);

  res.status(201).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      ward: user.ward,
    },
    access,
    refresh,
  });
});

// POST /api/auth/login/
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required." });
  }
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password." });
  }
  if (!user.isActive) {
    return res.status(403).json({ error: "This account has been deactivated." });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const access = signAccessToken(user);
  const refresh = signRefreshToken(user);

  res.json({ access, refresh });
});

// POST /api/auth/refresh/
const refresh = asyncHandler(async (req, res) => {
  const { refresh: refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: "refresh token is required." });
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired refresh token." });
  }

  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  if (!user || !user.isActive) {
    return res.status(401).json({ error: "Invalid refresh token." });
  }

  const access = signAccessToken(user);
  res.json({ access });
});

// POST /api/auth/logout/
// Stateless JWT logout: client discards tokens. If you need server-side
// invalidation, add a TokenBlacklist model and check it in requireAuth.
const logout = asyncHandler(async (req, res) => {
  res.json({ message: "Logged out successfully. Discard your tokens client-side." });
});

module.exports = { register, login, refresh, logout };

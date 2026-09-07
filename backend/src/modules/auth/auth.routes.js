const express = require("express");
const router = express.Router();
const { register, login, getCurrentUser, refresh, logout } = require("./auth.controller");
const { requireAuth } = require("../../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, getCurrentUser);

module.exports = router;

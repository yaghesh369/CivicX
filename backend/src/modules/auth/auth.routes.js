const express = require("express");
const router = express.Router();
const { register, login, refresh, logout } = require("./auth.controller");
const { requireAuth } = require("../../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", requireAuth, logout);

module.exports = router;

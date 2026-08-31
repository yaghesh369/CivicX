const express = require("express");
const router = express.Router();
const { requireAuth } = require("../../middleware/auth");
const { requireRole } = require("../../middleware/role");
const ctrl = require("../departments/departments.controller");

router.use(requireAuth);

router.post("/", requireRole("ADMIN", "OFFICER"), ctrl.createWorker);
router.patch("/:id", requireRole("ADMIN", "OFFICER"), ctrl.updateWorker);

module.exports = router;

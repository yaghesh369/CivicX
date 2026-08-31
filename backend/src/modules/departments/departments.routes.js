const express = require("express");
const router = express.Router();
const { requireAuth } = require("../../middleware/auth");
const { requireRole } = require("../../middleware/role");
const ctrl = require("./departments.controller");

router.use(requireAuth);

router.get("/", ctrl.listDepartments);
router.post("/", requireRole("ADMIN"), ctrl.createDepartment);
router.patch("/:id", requireRole("ADMIN"), ctrl.updateDepartment);
router.get("/:id/workers", requireRole("ADMIN", "OFFICER"), ctrl.listDepartmentWorkers);

module.exports = router;

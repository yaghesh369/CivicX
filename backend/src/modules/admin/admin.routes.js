const express = require("express");
const router = express.Router();
const { requireAuth } = require("../../middleware/auth");
const { requireRole } = require("../../middleware/role");
const ctrl = require("./admin.controller");

router.use(requireAuth, requireRole("ADMIN", "OFFICER"));

router.get("/dashboard", ctrl.dashboard);
router.get("/complaints", ctrl.allComplaints);
router.get("/statistics", ctrl.statistics);
router.get("/categories", ctrl.categoryBreakdown);
router.get("/wards", ctrl.wardBreakdown);
router.get("/heatmap", ctrl.heatmap);

module.exports = router;

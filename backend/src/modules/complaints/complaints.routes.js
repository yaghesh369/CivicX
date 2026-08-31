const express = require("express");
const router = express.Router();
const { requireAuth } = require("../../middleware/auth");
const { requireRole } = require("../../middleware/role");
const { upload } = require("../../middleware/upload");
const ctrl = require("./complaints.controller");

router.use(requireAuth);

// Static/specific routes MUST come before the /:id routes.
router.get("/my", ctrl.myComplaints);
router.get("/nearby", ctrl.nearbyComplaints);

router.post("/", ctrl.createComplaint);
router.get("/", ctrl.listComplaints);

router.get("/:id", ctrl.getComplaint);
router.patch("/:id", ctrl.updateComplaint);
router.delete("/:id", ctrl.deleteComplaint);

router.get("/:id/timeline", ctrl.getTimeline);
router.patch("/:id/status", requireRole("WORKER", "OFFICER", "ADMIN"), ctrl.updateStatus);
router.post("/:id/assign", requireRole("OFFICER", "ADMIN"), ctrl.assignComplaint);
router.post("/:id/verify", requireRole("OFFICER", "ADMIN"), ctrl.verifyComplaint);
router.post("/:id/reopen", ctrl.reopenComplaint);
router.post("/:id/images", upload.single("image"), ctrl.uploadImage);

module.exports = router;

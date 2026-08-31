const asyncHandler = require("express-async-handler");
const prisma = require("../../config/prisma");

// POST /api/complaints/:id/feedback/
const createFeedback = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const complaintId = req.params.id;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "rating must be between 1 and 5." });
  }

  const complaint = await prisma.complaint.findUnique({ where: { id: complaintId } });
  if (!complaint) return res.status(404).json({ error: "Complaint not found." });
  if (complaint.userId !== req.user.id) {
    return res.status(403).json({ error: "Only the complaint owner can leave feedback." });
  }
  if (!["RESOLVED", "CITIZEN_VERIFIED"].includes(complaint.status)) {
    return res.status(400).json({ error: "Feedback can only be given after resolution." });
  }

  const existing = await prisma.feedback.findUnique({ where: { complaintId } });
  if (existing) return res.status(409).json({ error: "Feedback already submitted for this complaint." });

  const feedback = await prisma.feedback.create({
    data: { complaintId, userId: req.user.id, rating: parseInt(rating), comment },
  });

  // Feedback implies citizen verification of the resolution.
  await prisma.complaint.update({ where: { id: complaintId }, data: { status: "CITIZEN_VERIFIED" } });
  await prisma.complaintStatusHistory.create({
    data: {
      complaintId,
      oldStatus: complaint.status,
      newStatus: "CITIZEN_VERIFIED",
      changedById: req.user.id,
      comment: "Citizen submitted feedback and verified resolution.",
    },
  });

  res.status(201).json(feedback);
});

// GET /api/complaints/:id/feedback/
const getFeedback = asyncHandler(async (req, res) => {
  const feedback = await prisma.feedback.findUnique({ where: { complaintId: req.params.id } });
  if (!feedback) return res.status(404).json({ error: "No feedback found for this complaint." });
  res.json(feedback);
});

module.exports = { createFeedback, getFeedback };

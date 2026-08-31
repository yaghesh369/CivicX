const asyncHandler = require("express-async-handler");
const prisma = require("../../config/prisma");

// POST /api/complaints/:id/ai-analysis/
// Called by Member 2's AI service (or a job that talks to it) to store a prediction.
const saveAIAnalysis = asyncHandler(async (req, res) => {
  const { category, priority, department, confidence, reason } = req.body;
  const complaintId = req.params.id;

  const complaint = await prisma.complaint.findUnique({ where: { id: complaintId } });
  if (!complaint) return res.status(404).json({ error: "Complaint not found." });

  const analysis = await prisma.aIAnalysis.upsert({
    where: { complaintId },
    update: { category, priority, department, confidence, reason },
    create: { complaintId, category, priority, department, confidence, reason },
  });

  // Optionally auto-apply the AI suggestion to the complaint's category/priority
  // if the confidence is high and it hasn't been verified by an officer yet.
  if (confidence >= 0.85 && complaint.status === "SUBMITTED") {
    await prisma.complaint.update({
      where: { id: complaintId },
      data: { category: category || complaint.category, priority: priority || complaint.priority },
    });
  }

  res.status(201).json(analysis);
});

// GET /api/complaints/:id/ai-analysis/
const getAIAnalysis = asyncHandler(async (req, res) => {
  const analysis = await prisma.aIAnalysis.findUnique({ where: { complaintId: req.params.id } });
  if (!analysis) return res.status(404).json({ error: "No AI analysis found for this complaint." });
  res.json(analysis);
});

// POST /api/complaints/:id/duplicate-group/
// Groups this complaint's duplicates under a main complaint.
const createDuplicateGroup = asyncHandler(async (req, res) => {
  const { duplicateComplaintIds } = req.body;
  const mainComplaintId = req.params.id;

  if (!Array.isArray(duplicateComplaintIds) || duplicateComplaintIds.length === 0) {
    return res.status(400).json({ error: "duplicateComplaintIds must be a non-empty array." });
  }

  const group = await prisma.duplicateGroup.create({
    data: { mainComplaintId, duplicateComplaintIds },
  });

  res.status(201).json(group);
});

module.exports = { saveAIAnalysis, getAIAnalysis, createDuplicateGroup };

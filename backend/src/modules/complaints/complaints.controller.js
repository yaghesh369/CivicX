const asyncHandler = require("express-async-handler");
const prisma = require("../../config/prisma");
const { generateComplaintNumber } = require("../../utils/complaintNumber");

// Valid forward transitions for the main workflow.
// REOPENED can branch off CITIZEN_VERIFIED, and REJECTED can happen from
// SUBMITTED/VERIFIED.
const VALID_TRANSITIONS = {
  SUBMITTED: ["VERIFIED", "REJECTED"],
  VERIFIED: ["ASSIGNED", "REJECTED"],
  ASSIGNED: ["IN_PROGRESS"],
  IN_PROGRESS: ["RESOLVED"],
  RESOLVED: ["CITIZEN_VERIFIED", "REOPENED"],
  CITIZEN_VERIFIED: ["REOPENED"],
  REOPENED: ["VERIFIED", "ASSIGNED"],
  REJECTED: [],
};

async function recordStatusHistory(complaintId, oldStatus, newStatus, userId, comment) {
  await prisma.complaintStatusHistory.create({
    data: {
      complaintId,
      oldStatus: oldStatus || null,
      newStatus,
      changedById: userId,
      comment: comment || null,
    },
  });
}

async function notify(userId, complaintId, title, message, type) {
  await prisma.notification.create({
    data: { userId, complaintId, title, message, type },
  });
}

// POST /api/complaints/
const createComplaint = asyncHandler(async (req, res) => {
  const { title, description, category, latitude, longitude, address, ward } = req.body;

  if (!title || !description || !category) {
    return res.status(400).json({ error: "title, description and category are required." });
  }
  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: "latitude and longitude are required." });
  }

  const complaintNumber = await generateComplaintNumber();

  const complaint = await prisma.complaint.create({
    data: {
      complaintNumber,
      userId: req.user.id,
      title,
      description,
      category,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      address,
      ward: ward || req.user.ward,
      status: "SUBMITTED",
    },
  });

  await recordStatusHistory(complaint.id, null, "SUBMITTED", req.user.id, "Complaint created.");
  await notify(req.user.id, complaint.id, "Complaint Submitted", `Your complaint ${complaint.complaintNumber} was submitted.`, "COMPLAINT_SUBMITTED");

  res.status(201).json(complaint);
});

// GET /api/complaints/  (supports filter, search, pagination)
const listComplaints = asyncHandler(async (req, res) => {
  const { category, status, ward, priority, department, search, page = 1, page_size = 20 } = req.query;

  const where = {};
  if (category) where.category = category;
  if (status) where.status = status;
  if (ward) where.ward = ward;
  if (priority) where.priority = priority;
  if (department) where.departmentId = department;
  if (search) {
    where.OR = [
      { complaintNumber: { contains: search, mode: "insensitive" } },
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { address: { contains: search, mode: "insensitive" } },
    ];
  }

  // Non-admin/officer users only see complaints scoped to their role.
  if (req.user.role === "CITIZEN") {
    where.userId = req.user.id;
  }

  const take = Math.min(parseInt(page_size), 100);
  const skip = (parseInt(page) - 1) * take;

  const [items, total] = await Promise.all([
    prisma.complaint.findMany({
      where,
      take,
      skip,
      orderBy: { createdAt: "desc" },
      include: { assignment: true, aiAnalysis: true },
    }),
    prisma.complaint.count({ where }),
  ]);

  res.json({
    count: total,
    page: parseInt(page),
    page_size: take,
    total_pages: Math.ceil(total / take),
    results: items,
  });
});

// GET /api/complaints/my/
const myComplaints = asyncHandler(async (req, res) => {
  const items = await prisma.complaint.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
    include: { assignment: true, aiAnalysis: true },
  });
  res.json(items);
});

// GET /api/complaints/:id/
const getComplaint = asyncHandler(async (req, res) => {
  const complaint = await prisma.complaint.findUnique({
    where: { id: req.params.id },
    include: {
      images: true,
      assignment: { include: { worker: { include: { user: true } } } },
      aiAnalysis: true,
      department: true,
      user: { select: { id: true, name: true, email: true, ward: true } },
    },
  });
  if (!complaint) return res.status(404).json({ error: "Complaint not found." });

  // Citizens can only view their own complaints.
  if (req.user.role === "CITIZEN" && complaint.userId !== req.user.id) {
    return res.status(403).json({ error: "You do not have access to this complaint." });
  }

  res.json(complaint);
});

// PATCH /api/complaints/:id/
const updateComplaint = asyncHandler(async (req, res) => {
  const complaint = await prisma.complaint.findUnique({ where: { id: req.params.id } });
  if (!complaint) return res.status(404).json({ error: "Complaint not found." });

  const isOwner = complaint.userId === req.user.id;
  const isStaff = ["OFFICER", "ADMIN"].includes(req.user.role);
  if (!isOwner && !isStaff) {
    return res.status(403).json({ error: "You do not have permission to update this complaint." });
  }

  const allowedFields = isStaff
    ? ["title", "description", "category", "priority", "departmentId"]
    : ["title", "description"];

  const data = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) data[field] = req.body[field];
  }

  const updated = await prisma.complaint.update({ where: { id: complaint.id }, data });
  res.json(updated);
});

// DELETE /api/complaints/:id/
const deleteComplaint = asyncHandler(async (req, res) => {
  const complaint = await prisma.complaint.findUnique({ where: { id: req.params.id } });
  if (!complaint) return res.status(404).json({ error: "Complaint not found." });

  const isOwner = complaint.userId === req.user.id;
  if (!isOwner && req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "You do not have permission to delete this complaint." });
  }

  // A complaint has child records in several tables (status history, images,
  // assignment, AI analysis, feedback, notifications). Postgres blocks the
  // delete until those are removed first, so we do it all as one transaction.
  await prisma.$transaction([
    prisma.notification.deleteMany({ where: { complaintId: complaint.id } }),
    prisma.feedback.deleteMany({ where: { complaintId: complaint.id } }),
    prisma.aIAnalysis.deleteMany({ where: { complaintId: complaint.id } }),
    prisma.complaintImage.deleteMany({ where: { complaintId: complaint.id } }),
    prisma.complaintAssignment.deleteMany({ where: { complaintId: complaint.id } }),
    prisma.complaintStatusHistory.deleteMany({ where: { complaintId: complaint.id } }),
    prisma.duplicateGroup.deleteMany({ where: { mainComplaintId: complaint.id } }),
    prisma.complaint.delete({ where: { id: complaint.id } }),
  ]);

  res.status(204).send();
});

// GET /api/complaints/:id/timeline/
const getTimeline = asyncHandler(async (req, res) => {
  const complaint = await prisma.complaint.findUnique({ where: { id: req.params.id } });
  if (!complaint) return res.status(404).json({ error: "Complaint not found." });

  if (req.user.role === "CITIZEN" && complaint.userId !== req.user.id) {
    return res.status(403).json({ error: "You do not have access to this complaint." });
  }

  const history = await prisma.complaintStatusHistory.findMany({
    where: { complaintId: complaint.id },
    orderBy: { createdAt: "asc" },
    include: { changedBy: { select: { id: true, name: true, role: true } } },
  });

  res.json(history);
});

// PATCH /api/complaints/:id/status/
const updateStatus = asyncHandler(async (req, res) => {
  const { status, comment } = req.body;
  if (!status) return res.status(400).json({ error: "status is required." });

  const complaint = await prisma.complaint.findUnique({ where: { id: req.params.id } });
  if (!complaint) return res.status(404).json({ error: "Complaint not found." });

  const allowed = VALID_TRANSITIONS[complaint.status] || [];
  if (!allowed.includes(status)) {
    return res.status(400).json({
      error: `Invalid status transition from ${complaint.status} to ${status}.`,
      allowedTransitions: allowed,
    });
  }

  const data = { status };
  if (status === "RESOLVED") data.resolvedAt = new Date();

  const updated = await prisma.complaint.update({ where: { id: complaint.id }, data });
  await recordStatusHistory(complaint.id, complaint.status, status, req.user.id, comment);

  const notifMap = {
    VERIFIED: ["Complaint Verified", "Your complaint has been verified.", "GENERAL"],
    IN_PROGRESS: ["Work Started", "Work has started on your complaint.", "WORK_STARTED"],
    RESOLVED: ["Complaint Resolved", "Your complaint has been marked resolved. Please verify.", "COMPLAINT_RESOLVED"],
    REJECTED: ["Complaint Rejected", "Your complaint was rejected.", "GENERAL"],
  };
  if (notifMap[status]) {
    const [title, message, type] = notifMap[status];
    await notify(complaint.userId, complaint.id, title, message, type);
  }

  res.json(updated);
});

// POST /api/complaints/:id/assign/  (Officer/Admin only)
const assignComplaint = asyncHandler(async (req, res) => {
  const { workerId } = req.body;
  if (!workerId) return res.status(400).json({ error: "workerId is required." });

  const complaint = await prisma.complaint.findUnique({ where: { id: req.params.id } });
  if (!complaint) return res.status(404).json({ error: "Complaint not found." });

  const worker = await prisma.worker.findUnique({ where: { id: workerId } });
  if (!worker) return res.status(404).json({ error: "Worker not found." });
  if (!worker.isActive) return res.status(400).json({ error: "Cannot assign to an inactive worker." });

  const existing = await prisma.complaintAssignment.findUnique({ where: { complaintId: complaint.id } });
  if (existing) {
    // Reassignment: update instead of erroring.
    await prisma.complaintAssignment.update({
      where: { complaintId: complaint.id },
      data: { workerId, assignedById: req.user.id, assignedAt: new Date(), completedAt: null },
    });
  } else {
    await prisma.complaintAssignment.create({
      data: { complaintId: complaint.id, workerId, assignedById: req.user.id },
    });
  }

  const updated = await prisma.complaint.update({
    where: { id: complaint.id },
    data: { status: "ASSIGNED", departmentId: worker.departmentId },
  });

  await recordStatusHistory(complaint.id, complaint.status, "ASSIGNED", req.user.id, `Assigned to worker ${workerId}`);
  await notify(worker.userId, complaint.id, "Complaint Assigned", `You have been assigned complaint ${complaint.complaintNumber}.`, "COMPLAINT_ASSIGNED");

  res.json(updated);
});

// POST /api/complaints/:id/verify/  (Officer/Admin only — verifies a submitted complaint)
const verifyComplaint = asyncHandler(async (req, res) => {
  const complaint = await prisma.complaint.findUnique({ where: { id: req.params.id } });
  if (!complaint) return res.status(404).json({ error: "Complaint not found." });
  if (complaint.status !== "SUBMITTED" && complaint.status !== "REOPENED") {
    return res.status(400).json({ error: `Cannot verify complaint in status ${complaint.status}.` });
  }

  const updated = await prisma.complaint.update({ where: { id: complaint.id }, data: { status: "VERIFIED" } });
  await recordStatusHistory(complaint.id, complaint.status, "VERIFIED", req.user.id, req.body.comment);
  res.json(updated);
});

// POST /api/complaints/:id/reopen/  (Citizen only, after CITIZEN_VERIFIED/RESOLVED)
const reopenComplaint = asyncHandler(async (req, res) => {
  const complaint = await prisma.complaint.findUnique({ where: { id: req.params.id } });
  if (!complaint) return res.status(404).json({ error: "Complaint not found." });

  if (complaint.userId !== req.user.id) {
    return res.status(403).json({ error: "Only the complaint owner can reopen it." });
  }
  if (!["RESOLVED", "CITIZEN_VERIFIED"].includes(complaint.status)) {
    return res.status(400).json({ error: `Cannot reopen complaint in status ${complaint.status}.` });
  }

  const updated = await prisma.complaint.update({ where: { id: complaint.id }, data: { status: "REOPENED", resolvedAt: null } });
  await recordStatusHistory(complaint.id, complaint.status, "REOPENED", req.user.id, req.body.comment || "Citizen reopened complaint.");
  res.json(updated);
});

// GET /api/complaints/nearby/?latitude=&longitude=&category=
const nearbyComplaints = asyncHandler(async (req, res) => {
  const { latitude, longitude, category, radius_km = 1 } = req.query;
  if (!latitude || !longitude) {
    return res.status(400).json({ error: "latitude and longitude are required." });
  }

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  const radius = parseFloat(radius_km);

  // Simple bounding-box pre-filter (fast, good enough for city-scale wards),
  // then Haversine distance in JS for accuracy.
  const latDelta = radius / 111; // ~111km per degree latitude
  const lngDelta = radius / (111 * Math.cos((lat * Math.PI) / 180));

  const where = {
    latitude: { gte: lat - latDelta, lte: lat + latDelta },
    longitude: { gte: lng - lngDelta, lte: lng + lngDelta },
  };
  if (category) where.category = category;

  const candidates = await prisma.complaint.findMany({ where, take: 200 });

  function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  const results = candidates
    .map((c) => ({ ...c, distanceKm: haversine(lat, lng, c.latitude, c.longitude) }))
    .filter((c) => c.distanceKm <= radius)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  res.json(results);
});

// POST /api/complaints/:id/images/  (upload BEFORE/AFTER/EVIDENCE images)
const uploadImage = asyncHandler(async (req, res) => {
  const { imageType = "EVIDENCE" } = req.body;
  if (!req.file) return res.status(400).json({ error: "No image file uploaded." });

  const complaint = await prisma.complaint.findUnique({ where: { id: req.params.id } });
  if (!complaint) return res.status(404).json({ error: "Complaint not found." });

  const image = await prisma.complaintImage.create({
    data: {
      complaintId: complaint.id,
      imageUrl: `/uploads/${req.file.filename}`,
      imageType,
      uploadedById: req.user.id,
    },
  });

  res.status(201).json(image);
});

module.exports = {
  createComplaint,
  listComplaints,
  myComplaints,
  getComplaint,
  updateComplaint,
  deleteComplaint,
  getTimeline,
  updateStatus,
  assignComplaint,
  verifyComplaint,
  reopenComplaint,
  nearbyComplaints,
  uploadImage,
};

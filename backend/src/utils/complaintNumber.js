const prisma = require("../config/prisma");

/**
 * Generates the next sequential complaint number, e.g. CIV-000001.
 * Uses a count-based approach; for high-concurrency production use,
 * switch this to a DB sequence.
 */
async function generateComplaintNumber() {
  const count = await prisma.complaint.count();
  const next = count + 1;
  return `CIV-${String(next).padStart(6, "0")}`;
}

module.exports = { generateComplaintNumber };

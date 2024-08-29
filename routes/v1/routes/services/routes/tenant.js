const express = require("express");
const router = express.Router();
const prisma = require("../../../../../config/prisma");
const prismaErrorHelper = require("../../../../../helpers/prismaErrorHelper");
const createResponse = require("../../../../../helpers/createResponse");

//Returns the doucments that have been created by a tenant
router.get("/documents/:tenantOrgId", async (req, res, next) => {
  const { tenantOrgId } = req.params;

  // Get pagination parameters from query (default to page 1, limit 10)
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const [documents, totalDocuments] = await Promise.all([
      prisma.document.findMany({
        where: {
          tenantOrgId: tenantOrgId,
        },
        skip: skip,
        take: limit,
      }),
      prisma.document.count({
        where: {
          tenantOrgId: tenantOrgId,
        },
      }),
    ]);

    const totalPages = Math.ceil(totalDocuments / limit);

    const paginationInfo = {
      totalDocuments,
      totalPages,
      currentPage: page,
      perPage: limit,
    };

    return createResponse(res, 200, "Documents retrieved successfully", {
      documents,
      pagination: paginationInfo,
    });
  } catch (error) {
    const { statusCode, message } = prismaErrorHelper(error);
    return createResponse(res, statusCode, message, null, {
      code: "DATABASE_ERROR",
      description: error.message,
    });
  }
});

module.exports = router;

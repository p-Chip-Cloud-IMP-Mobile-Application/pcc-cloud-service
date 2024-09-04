const express = require("express");
const router = express.Router();
const prisma = require("../../../../../config/prisma");
const prismaErrorHelper = require("../../../../../helpers/prismaErrorHelper");
const createResponse = require("../../../../../helpers/createResponse");

/**
 * @swagger
 * /user-requests/auth-user-details:
 *   get:
 *     summary: Get authenticated user's details
 *     description: >
 *       Retrieves the authenticated user's profile, including their default tenant,
 *       other available tenants, and the organizations within the current tenant.
 *       The default tenantId and tenantUserId are by default set in the users claims.
 *     tags:
 *       - User
 *       - Customer Story
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "Request successful"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Request successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userProfile:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "user_12345"
 *                         uid:
 *                           type: string
 *                           example: "UID12345"
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                         email:
 *                           type: string
 *                           example: "john.doe@example.com"
 *                         tenant:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               example: "tenant_67890"
 *                             name:
 *                               type: string
 *                               example: "Default Tenant"
 *                         tenantProfile:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               example: "tenantUser_12345"
 *                             tenantId:
 *                               type: string
 *                               example: "tenant_67890"
 *                             tenantName:
 *                               type: string
 *                               example: "Default Tenant"
 *                             role:
 *                               type: string
 *                               example: "admin"
 *                             isActive:
 *                               type: boolean
 *                               example: true
 *                         otherTenantProfiles:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "tenantUser_67890"
 *                               tenantId:
 *                                 type: string
 *                                 example: "tenant_23456"
 *                               tenantName:
 *                                 type: string
 *                                 example: "Other Tenant"
 *                               role:
 *                                 type: string
 *                                 example: "user"
 *                               isActive:
 *                                 type: boolean
 *                                 example: true
 *                     activeTenantProfile:
 *                       type: object
 *                       properties:
 *                         tenant:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               example: "tenant_67890"
 *                             name:
 *                               type: string
 *                               example: "Current Tenant"
 *                         tenantProfiles:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               example: "tenantUser_67890"
 *                             tenantId:
 *                               type: string
 *                               example: "tenant_67890"
 *                             tenantName:
 *                               type: string
 *                               example: "Current Tenant"
 *                             role:
 *                               type: string
 *                               example: "admin"
 *                             isActive:
 *                               type: boolean
 *                               example: true
 *                         tenantOrganizations:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "org_123"
 *                               name:
 *                                 type: string
 *                                 example: "Organization Name"
 *                               role:
 *                                 type: string
 *                                 example: "read-write"
 *       400:
 *         description: "Missing or malformed claims"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Missing or malformed claims"
 *       404:
 *         description: "User or current tenant user not found"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "User or current tenant user not found"
 *       500:
 *         description: "Uncaught error"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Uncaught Error"
 */

router.get("/auth-user-details", async (req, res) => {
  const { id, tenantId, tenantUserId } = req.customClaims;

  if (!id || !tenantId || !tenantUserId) {
    console.error("Missing or malformed custom claims:", req.customClaims);

    return createResponse(res, 400, "Missing or malformed claims", null, null);
  }
  try {
    try {
      //Get the authenticated user profile
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          uid: true,
          name: true,
          email: true,
          defaultTenantUser: {
            select: {
              id: true,
              tenant: { select: { id: true, name: true } },
              role: true,
              isActive: true,
            },
          },
          tenantUsers: {
            select: {
              id: true,
              tenant: { select: { id: true, name: true } },
              role: true,
              isActive: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const tenantUserProfiles = user.tenantUsers.map((profile) => ({
        id: profile.id,
        tenantId: profile.tenant.id,
        tenantName: profile.tenant.name,
        role: profile.role,
        isActive: profile.isActive,
      }));

      const userProfile = {
        id: user.id,
        uid: user.uid,
        name: user.name,
        email: user.email,
        tenant: {
          id: user.defaultTenantUser.tenant.id,
          name: user.defaultTenantUser.tenant.name,
        },
        tenantProfile: {
          id: user.defaultTenantUser.id,
          tenantId: user.defaultTenantUser.tenant.id,
          tenantName: user.defaultTenantUser.tenant.name,
          role: user.defaultTenantUser.role,
          isActive: user.defaultTenantUser.isActive,
        },
        otherTenantProfiles: tenantUserProfiles,
      };

      const currentLoggedTenantUser = await prisma.tenantUser.findUnique({
        where: { id: tenantUserId },
        select: {
          id: true,
          tenant: { select: { id: true, name: true } },
          role: true,
          isActive: true,
          tenantOrgUser: {
            select: {
              tenantOrg: { select: { id: true, name: true } },
              permission: true,
            },
          },
        },
      });

      if (!currentLoggedTenantUser) {
        return res.status(404).json({ error: "Current tenant user not found" });
      }

      const profileOrganizations = currentLoggedTenantUser.tenantOrgUser.map(
        (org) => ({
          id: org.tenantOrg.id,
          name: org.tenantOrg.name,
          role: org.permission,
        })
      );

      const activeTenantProfile = {
        tenant: {
          id: currentLoggedTenantUser.tenant.id,
          name: currentLoggedTenantUser.tenant.name,
        },
        tenantProfile: {
          id: currentLoggedTenantUser.id,
          tenantId: currentLoggedTenantUser.tenant.id,
          tenantName: currentLoggedTenantUser.tenant.name,
          role: currentLoggedTenantUser.role,
          isActive: currentLoggedTenantUser.isActive,
        },
        tenantOrganizations: profileOrganizations,
      };

      const response = {
        userProfile: userProfile,
        activeTenantUserProfile: activeTenantProfile,
      };

      console.log("User found", user);
      return res
        .status(200)
        .json({ message: "Request successful", data: response });
    } catch (error) {
      console.error("Error retrieving user details:", error);
      const { statusCode, message } = prismaErrorHelper(error);
      return res.status(statusCode).json({ error: message });
    }
  } catch (error) {
    return createResponse(res, 500, "Uncaught Error", null, error);
  }
});

/**
 * @swagger
 * /user-requests/tenant-user-documents:
 *   get:
 *     summary: Get recent documents accessible to the authenticated user
 *     description: >
 *       Returns the most recent documents created that an authenticated user's permissions
 *       and group assignments allow them access to. The results are paginated.
 *     tags:
 *       - Documents
 *       - User
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: The page number to retrieve.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 25
 *         description: The number of documents to retrieve per page.
 *     responses:
 *       200:
 *         description: "Resources found"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 documents:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "doc_12345"
 *                       uid:
 *                         type: string
 *                         example: "DOC-2023-001"
 *                       image:
 *                         type: string
 *                         example: "https://example.com/image.png"
 *                       name:
 *                         type: string
 *                         example: "Document Name"
 *                       description:
 *                         type: string
 *                         example: "A description of the document."
 *                       type:
 *                         type: string
 *                         example: "Invoice"
 *                       documentFields:
 *                         type: object
 *                         properties:
 *                           documentHeader:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 key:
 *                                   type: string
 *                                   example: "header_1"
 *                                 label:
 *                                   type: string
 *                                   example: "Header Label"
 *                                 type:
 *                                   type: string
 *                                   example: "text"
 *                                 value:
 *                                   type: string
 *                                   example: "Header Value"
 *                           documentBody:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 key:
 *                                   type: string
 *                                   example: "body_1"
 *                                 label:
 *                                   type: string
 *                                   example: "Body Label"
 *                                 type:
 *                                   type: string
 *                                   example: "text"
 *                                 value:
 *                                   type: string
 *                                   example: "Body Value"
 *                       createdDate:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-08-01T12:34:56Z"
 *                       createdOrganziation:
 *                         type: string
 *                         example: "Organization Name"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalDocuments:
 *                       type: integer
 *                       example: 100
 *                     totalPages:
 *                       type: integer
 *                       example: 4
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     perPage:
 *                       type: integer
 *                       example: 25
 *       500:
 *         description: "Uncaught Error"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Uncaught Error"
 */

router.get("/tenant-user-documents", async (req, res, next) => {
  const customClaims = req.customClaims;
  const { tenantId, tenantUserId, role, tenantOrgs } = customClaims;

  //Pagination variables
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  const skip = (page - 1) * limit;

  let documents;

  try {
    if (role === "administrator") {
      const tenantDocuments = await prisma.document.findMany({
        where: {
          tenantId: tenantId,
        },
        orderBy: {
          updatedAt: "desc",
        },
        include: {
          documentTemplate: {
            include: {
              documentConfig: true,
            },
          },
          tenantOrg: true,
        },
        skip: skip,
        take: limit,
      });

      documents = tenantDocuments;
    }

    if (role === "manager") {
      const tenantOrgIds = tenantOrgs.map((org) => ({
        id: org.id,
      }));

      const tenantOrgDocuments = await prisma.document.findMany({
        where: {
          tenantOrgId: {
            in: tenantOrgIds,
          },
        },
        include: {
          documentTemplate: {
            include: {
              documentConfig: true,
            },
          },
          tenantOrg: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
        skip: skip,
        take: limit,
      });

      documents = tenantOrgDocuments;
    }

    if (role === "individual") {
      const tenantOrgIds = tenantOrgs.map((org) => ({
        id: org.id,
      }));

      const tenantUserDocuments = await prisma.document.findMany({
        where: {
          createdById: tenantUserId,
        },
        include: {
          documentTemplate: {
            include: {
              documentConfig: true,
            },
          },
          tenantOrg: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
        skip: skip,
        take: limit,
      });

      documents = tenantUserDocuments;
    }

    const totalPages = Math.ceil(documents.length / limit);

    const pagination = {
      totalDocuments: documents.length,
      totalPages: totalPages,
      currentPage: page,
      perPage: limit,
    };

    const returnedDocuments = documents.map((document) => ({
      id: document.id,
      uid: document.uid,
      image: document.documentTemplate.image,
      name: document.documentTemplate.name,
      description: document.documentTemplate.description,
      type: document.documentTemplate.documentConfig.name,
      documentFields: {
        documentHeader:
          document.documentTemplate.templateFieldConfig.templateFields.map(
            (field) => ({
              key: field.key,
              label: field.label,
              type: field.type,
              value: field.value,
            })
          ),
        documentBody: document.documentFields.map((field) => ({
          key: field.key,
          label: field.label,
          type: field.type,
          value: field.value,
        })),
      },
      createdDate: document.createdAt,
      createdOrganziation: document.tenantOrg.name,
    }));

    const response = {
      documents: returnedDocuments,
      pagination: pagination,
    };
    return createResponse(res, 200, "Resources found", response, null);
  } catch (error) {
    return createResponse(res, 500, "Uncaught Error", null, error);
  }
});

router.get("/search", async (req, res) => {
  const { query } = req.query;
  const { tenantId } = req.customClaims;

  if (!query) {
    return res.status(400).json({
      status: "error",
      message: "Search query is required",
    });
  }

  try {
    const documentTemplatesResults = await prisma.documentTemplate.findMany({
      where: {
        tenantId: tenantId,
        OR: [
          { id: { contains: query, mode: "insensitive" } }, // Partial string matching
          { name: { contains: query, mode: "insensitive" } }, // Partial string matching
        ],
      },
    });

    const documentResults = await prisma.document.findMany({
      where: {
        tenantId: tenantId,
        OR: [
          { uid: { contains: query, mode: "insensitive" } }, // Partial string matching
        ],
      },
    });

    const mticResults = await prisma.mTIC.findMany({
      where: {
        OR: [
          { id: { contains: query, mode: "insensitive" } }, // Partial string matching
          { uid: { contains: query, mode: "insensitive" } }, // Partial string matching
        ],
      },
    });

    const fileResults = await prisma.file.findMany({
      where: {
        tenantid: tenantId,
        OR: [
          { name: { contains: query, mode: "insensitive" } }, // Partial string matching
        ],
      },
    });

    // Combine results
    const results = {
      documentTemplates: documentTemplatesResults,
      documents: documentResults,
      mtics: mticResults,
      files: fileResults,
    };

    return res.status(200).json({
      status: "success",
      message: "Search results",
      data: results,
    });
  } catch (error) {
    console.error("Error performing search:", error);
    return res.status(500).json({
      status: "error",
      message: "An error occurred while performing the search",
      error: error.message,
    });
  }
});

module.exports = router;

module.exports = router;

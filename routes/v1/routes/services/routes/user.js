const express = require("express");
const router = express.Router();
const prisma = require("../../../../../config/prisma");
const prismaErrorHelper = require("../../../../../helpers/prismaErrorHelper");
const createResponse = require("../../../../../helpers/createResponse");

// Route to get authenticated user's details including their default tenant and other available tenants
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
        tenant_id: profile.tenant.id,
        tenant_name: profile.tenant.name,
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
        tenant_profile: {
          id: user.defaultTenantUser.id,
          tenant_id: user.defaultTenantUser.tenant.id,
          tenant_name: user.defaultTenantUser.tenant.name,
          role: user.defaultTenantUser.role,
          isActive: user.defaultTenantUser.isActive,
        },
        other_tenant_profiles: tenantUserProfiles,
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
        tenant_profile: {
          id: currentLoggedTenantUser.id,
          tenant_id: currentLoggedTenantUser.tenant.id,
          tenant_name: currentLoggedTenantUser.tenant.name,
          role: currentLoggedTenantUser.role,
          isActive: currentLoggedTenantUser.isActive,
        },
        tenant_organizations: profileOrganizations,
      };

      const response = {
        user_profile: userProfile,
        active_tenant_profile: activeTenantProfile,
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

//Returns the most recent documents created that an authenticated users permissions and group assignments allow them access to
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


module.exports = router;

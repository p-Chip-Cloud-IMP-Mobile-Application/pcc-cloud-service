const fs = require("fs");
const path = require("path");
const documentFieldSchema = require("./swagger/schemas/documentFieldSchema.json");

// Read the content of the Markdown file
const swaggerDescriptionPath = path.resolve(
  __dirname,
  "./swagger/swagger-description.md"
);
const swaggerDescription = fs.readFileSync(swaggerDescriptionPath, "utf-8");

const swaggerConfig = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "p-Chip Cloud - Services API Documentation",
      version: "0.1.0",
      description: swaggerDescription,
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
      contact: {
        name: "p-Chip Corporation",
        url: "https://p-chip.com",
        email: "info@p-chip.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000/api/v1/services",
        description: "Local development server",
      },
      {
        url: "https://pcc-cloud-service.azurewebsites.net/api/v1/services",
        description: "Production server",
      },
    ],
    tags: [
      {
        name: "Authentication",
        description: "Endpoints for user authentication and authorization.",
      },
      {
        name: "User",
        description:
          "Endpoints for obtaining the current logged in user details.",
      },
      {
        name: "Claims",
        description: "Endpoints for updating and retrieving JWT token claims.",
      },
      {
        name: "Documents",
        description:
          "APIs related to document handling, including creation, retrieval, and management.",
      },
      {
        name: "Document Templates",
        description:
          "APIs related to retrieving document templates that a user is authorized to create based on the selected tenant organization.",
      },
      {
        name: "MTIC Session",
        description:
          "Operations related to MTIC sessions and interactions with micro transponder identification chips.",
      },
      {
        name: "MTIC Documents",
        description:
          "Operations related to creating and retrieving MTIC documents and interactions with micro transponder identification chips.",
      },
      {
        name: "Customer Story",
        description:
          "A step by step walkthrough of how and when you would use these API's.",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT Bearer token with custom claims",
        },
      },
      schemas: {
        JWT: {
          type: "object",
          description: "Structure of the JWT token used for authentication.",
          properties: {
            name: {
              type: "string",
              description: "User's full name",
              example: "Jane Doe",
            },
            customClaims: {
              type: "object",
              description: "Custom claims included in the JWT token.",
              properties: {
                id: {
                  type: "string",
                  description: "Unique user ID on the platform",
                  example: "user_abc123",
                },
                tenantId: {
                  type: "string",
                  description: "Current tenant to which the user is logged in",
                  example: "tenant_xyz789",
                },
                tenantUserId: {
                  type: "string",
                  description: "Unique identifier of the user within a tenant",
                  example: "tenantUser_456def",
                },
                role: {
                  type: "string",
                  description:
                    "The role assigned to the user within the tenant",
                  example: "administrator",
                },
                tenantOrgs: {
                  type: "array",
                  description:
                    "List of organizations within the tenant that the user has access to",
                  items: {
                    type: "object",
                    properties: {
                      id: {
                        type: "string",
                        description: "Organization ID",
                        example: "org_001",
                      },
                      name: {
                        type: "string",
                        description: "Organization name",
                        example: "Acme Corp",
                      },
                      permission: {
                        type: "string",
                        description:
                          "Permissions granted to the user in this organization",
                        example: "read-write",
                      },
                    },
                  },
                },
              },
            },
            iss: {
              type: "string",
              description: "Issuer of the token",
              example: "https://securetoken.google.com/fake-project-id",
            },
            aud: {
              type: "string",
              description:
                "Audience for the token, typically the application's identifier",
              example: "fake-project-id",
            },
            auth_time: {
              type: "integer",
              description: "Time when the user was authenticated, in Unix time",
              example: 1690896000, // Example timestamp
            },
            user_id: {
              type: "string",
              description:
                "Unique identifier for the user in the authentication system",
              example: "authUser_987zyx",
            },
            sub: {
              type: "string",
              description:
                "Subject of the token, usually the same as the user ID",
              example: "authUser_987zyx",
            },
            iat: {
              type: "integer",
              description: "Time when the token was issued, in Unix time",
              example: 1690896000, // Example timestamp
            },
            exp: {
              type: "integer",
              description: "Expiration time of the token, in Unix time",
              example: 1690903200, // Example timestamp
            },
            email: {
              type: "string",
              description: "User's email address",
              example: "janedoe@example.com",
            },
            email_verified: {
              type: "boolean",
              description: "Whether the user's email has been verified",
              example: true,
            },
            firebase: {
              type: "object",
              description: "Firebase-specific claims",
              properties: {
                identities: {
                  type: "object",
                  properties: {
                    email: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                      example: ["janedoe@example.com"],
                    },
                  },
                },
                sign_in_provider: {
                  type: "string",
                  description:
                    "Method used to sign in (e.g., password, Google, etc.)",
                  example: "password",
                },
              },
            },
            uid: {
              type: "string",
              description: "Unique identifier for the user within Firebase",
              example: "authUser_987zyx",
            },
          },
        },
        "Document Field Schema": documentFieldSchema,
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/v1/routes/services/routes/*.js"], // Adjust path to your routes
};

module.exports = swaggerConfig;

// swaggerConfig.js
const swaggerConfig = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "p-Chip Cloud - API documented with Swagger",
      version: "0.1.0",
      description:
        "This is a CRUD API application made with Express and documented with Swagger",
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
        url: "http://localhost:3000",
        url: "https://pcc-cloud-service.azurewebsites.net/",
      },
    ],
  },
  apis: ["./routes/api/v1/services/auth/*.js"],
};

module.exports = swaggerConfig;

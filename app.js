const express = require("express");
const app = express();

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const swaggerConfig = require("./config/swagger");

const prisma = require("./config/prisma");
const errorHandler = require("./middleware/errorHandler");

const router = require("./router");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    myapi: "3.0.0",
    info: {
      title: "My API",
      version: "1.0.0",
      description: "API documentation",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./routes/v1/routes/services/routes/*.js"], // files containing annotations as above
};

const swaggerDocs = swaggerJsDoc(swaggerConfig);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use("/api", router);

app.use(errorHandler);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

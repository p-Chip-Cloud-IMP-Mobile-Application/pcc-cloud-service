const express = require("express");
const app = express();

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const swaggerConfig = require("./config/swagger");

const prisma = require("./config/prisma");
const errorHandler = require("./middleware/errorHandler");

const router = require("./router");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Swagger-jsdoc
const specs = swaggerJsdoc(swaggerConfig);

// Setup Swagger UI
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, { explorer: true })
);

app.use("/api", router);

app.use(errorHandler);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

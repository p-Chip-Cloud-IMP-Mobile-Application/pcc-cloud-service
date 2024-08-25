const express = require("express");
const app = express();
const prisma = require("./config/prisma");
const errorHandler = require("./middleware/errorHandler");

const router = require("./router");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

app.use(errorHandler);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

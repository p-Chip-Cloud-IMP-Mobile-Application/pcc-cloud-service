const multer = require("multer");

// Use memoryStorage for direct upload to Azure Blob Storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // Optional: Limit file size to 10 MB
  },
});

module.exports = upload;

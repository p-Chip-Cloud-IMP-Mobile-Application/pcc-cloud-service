const express = require("express");
const prisma = require("../config/prisma");
const containerClient = require("../config/blobStorageConfig");
const upload = require("../config/multerConfig");

const uploadFileMiddleware = (req, res, next) => {
  upload.single("file")(req, res, async (err) => {
    if (err) {
      return res
        .status(400)
        .json({ message: "File upload error", error: err.message });
    }

    const { tenantId } = req.customClaims;
    const { name } = req.body; // Extract the custom name from the request body

    try {
      const file = req.file;
      if (!file) {
        return res.status(400).send("No file uploaded.");
      }

      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const blobName = uniqueSuffix + "-" + file.originalname;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: {
          blobContentType: file.mimetype,
        },
      });

      // Save file reference in the database
      const savedFile = await prisma.file.create({
        data: {
          name: name || file.originalname, // Use the provided name, or fall back to the original filename
          fileName: file.originalname,
          blobName: blobName,
          containerName: containerClient.containerName,
          blobUrl: blockBlobClient.url,
          contentType: file.mimetype,
          fileSize: file.size,
          tenantid: tenantId,
        },
      });

      // Attach the saved file data to the request object
      req.savedFile = savedFile;

      // Proceed to the next middleware or route handler
      next();
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({
        message: "Error uploading file",
        error: error.message,
      });
    }
  });
};

module.exports = uploadFileMiddleware;

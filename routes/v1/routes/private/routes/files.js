const express = require("express");
const upload = require("../../../../../config/multerConfig");
const containerClient = require("../../../../../config/blobStorageConfig");
const prisma = require("../../../../../config/prisma");
const router = express.Router();

router.post("/", upload.single("file"), async (req, res) => {
  const { tenantId } = req.customClaims; // Assuming tenantOrgId is also part of custom claims

  console.log("Tenant Id", tenantId);

  try {
    const file = req.file;
    if (!file) {
      return res.status(400).send("No file uploaded.");
    }

    console.log("File", file);

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    console.log("Unique suffic", uniqueSuffix);
    const blobName = uniqueSuffix + "-" + file.originalname;
    console.log("BlobName", blobName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: {
        blobContentType: file.mimetype,
      },
    });

    // Save file reference in the database
    const savedFile = await prisma.file.create({
      data: {
        name: file.originalname, // Assuming 'name' is the original file name
        fileName: file.originalname,
        blobName: blobName,
        containerName: containerClient.containerName, // Get container name from client
        blobUrl: blockBlobClient.url,
        contentType: file.mimetype,
        fileSize: file.size, // Ensure the size is saved as BigInt
        tenantid: tenantId,
      },
    });

    console.log("Saved file", savedFile);

    res.status(200).json({
      message: "File uploaded and saved successfully",
      file: savedFile,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({
      message: "Error uploading file",
      error: error.message,
    });
  }
});

module.exports = router;

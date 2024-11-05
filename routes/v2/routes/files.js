const express = require("express");
const containerClient = require("../../../config/blobStorageConfig");
const upload = require("../../../config/multerConfig");
const prisma = require("../../../config/prisma");
const router = express.Router();

// Default error handling function
function handleError(res, error) {
  console.error("An error occurred:", error);
  if (error.code === "P2025") {
    return res.status(404).json({ error: "Resource not found" });
  }
  res.status(500).json({ error: "An unexpected error occurred" });
}

// Get route to retrieve a file by id
router.get("/:id", async (req, res) => {
  try {
    const fileId = req.params.id;
    const file = await prisma.files.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    res.status(200).json(file);
  } catch (error) {
    handleError(res, error);
  }
});

// Upload route (already provided)
router.post("/", upload.single("file"), async (req, res) => {
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

    const savedFile = await prisma.files.create({
      data: {
        name: file.originalname,
        fileName: file.originalname,
        blobName: blobName,
        containerName: containerClient.containerName,
        blobUrl: blockBlobClient.url,
        contentType: file.mimetype,
        fileSize: file.size,
      },
    });

    res.status(201).json(savedFile);
  } catch (error) {
    handleError(res, error);
  }
});

// Update route to modify file metadata or replace file
router.put("/:id", upload.single("file"), async (req, res) => {
  try {
    const fileId = req.params.id;
    const file = await prisma.files.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    let updatedData = {
      name: req.body.name || file.name,
      contentType: req.file ? req.file.mimetype : file.contentType,
    };

    if (req.file) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const blobName = uniqueSuffix + "-" + req.file.originalname;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      await blockBlobClient.uploadData(req.file.buffer, {
        blobHTTPHeaders: {
          blobContentType: req.file.mimetype,
        },
      });

      updatedData = {
        ...updatedData,
        blobName: blobName,
        blobUrl: blockBlobClient.url,
        fileSize: req.file.size,
      };

      const oldBlobClient = containerClient.getBlockBlobClient(file.blobName);
      await oldBlobClient.deleteIfExists();
    }

    const updatedFile = await prisma.files.update({
      where: { id: fileId },
      data: updatedData,
    });

    res.status(200).json(updatedFile);
  } catch (error) {
    handleError(res, error);
  }
});

// Delete route to remove a file by id
router.delete("/:id", async (req, res) => {
  try {
    const fileId = req.params.id;
    const file = await prisma.files.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const blockBlobClient = containerClient.getBlockBlobClient(file.blobName);
    await blockBlobClient.deleteIfExists();

    await prisma.files.delete({
      where: { id: fileId },
    });

    res.status(204).send();
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;

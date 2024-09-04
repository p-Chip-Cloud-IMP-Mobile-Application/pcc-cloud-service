const {
  BlobServiceClient,
  StorageSharedKeyCredential,
} = require("@azure/storage-blob");

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY; // Use the storage account key
const sasToken = process.env.AZURE_STORAGE_SAS_TOKEN;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

const blobServiceClient = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net`,
  new StorageSharedKeyCredential(accountName, accountKey) // Use the storage key credential
);

const containerClient = blobServiceClient.getContainerClient(containerName);

module.exports = containerClient;

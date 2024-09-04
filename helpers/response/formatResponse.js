// utils/formatResponse.js

const formatFileResponse = (file) => {
  return {
    id: file.id,
    name: file.name,
    fileName: file.fileName,
    url: file.blobUrl,
    contentType: file.contentType,
    fileSize: file.fileSize,
  };
};

module.exports = { formatFileResponse };

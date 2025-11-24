const buildFileResponse = (file) => {
    if (!file) return null;

  return {
    originalName: file.originalname,
    savedAs: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    path: file.path, // server filesystem path (internal)
  };

}
module.exports = buildFileResponse



const multer = require('multer');
const path = require('path');

// Storage
const storage = multer.memoryStorage();

// Filters
const imageFilter = (req, file, cb) => {
  file.mimetype.startsWith('image/')
    ? cb(null, true)
    : cb(new Error('Only image files allowed'), false);
};

const pdfFilter = (req, file, cb) => {
  file.mimetype === 'application/pdf'
    ? cb(null, true)
    : cb(new Error('Only PDF files allowed'), false);
};

// Multer middlewares (export these)
const uploadImage = multer({ storage, fileFilter: imageFilter }).single('image');
const uploadPdf = multer({ storage, fileFilter: pdfFilter }).single('file');

// If you want one endpoint that accepts ANY file
const upload = multer({ storage }); // no filter

module.exports = {
  uploadImage,
  uploadPdf,
  upload
};

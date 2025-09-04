// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// // Ensure upload folder exists
// const UPLOAD_ROOT = path.join(__dirname, '..', 'public', 'uploads', 'characters');
// fs.mkdirSync(UPLOAD_ROOT, { recursive: true });

// // Multer storage config
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const userId = req.user.id; // get from JWT/auth middleware
//     const dest = path.join(UPLOAD_ROOT, String(userId));
//     fs.mkdirSync(dest, { recursive: true });
//     cb(null, dest);
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//     cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//   },
// });

// // Only accept images
// const fileFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith('image/')) cb(null, true);
//   else cb(new Error('Only image uploads are allowed!'), false);
// };

// const upload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
// });

// module.exports = upload.single('referenceImage');

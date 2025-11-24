const path = require('path');
const fs = require('fs');
const multer = require('multer');

    const upload_dir = path.join(__dirname, "..", "..", "uploads");   //D:\Genimagine\backend\src\middle_ware (to) D:\Genimagine\backend\uploads
    console.log(upload_dir, "the path taken")

    if(!fs.existsSync(upload_dir)){
        fs.mkdirSync(upload_dir, {recursive : true})
    }

    // store to the disk storage
    const storage = multer.diskStorage({
        destination : (req, file, cb) => cb(null, upload_dir),
        filename : (req, file, cb) => {
            const ext = path.extname(file.originalname)
            const base = path.basename(file.originalname, ext);
            const safeBase = base.replace(/[^a-zA-Z0-9-_]/g, '_');
            cb(null, `${safeBase}-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`)
        }
    })

    const allowedmimetype = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ]

    function fileFilter(req, file, cb) {
    if (allowedmimetype.includes(file.mimetype)) {
        return cb(null, true);
    }
    // Use Error, not `error` from console
    cb(new Error("unsupported file type"));
}

const upload = multer({
    storage,
    fileFilter,             // remove this line to allow any mimetype
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

module.exports = {
    uploadSingle: upload.single("file")
};

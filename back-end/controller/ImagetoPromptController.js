const multer = require('multer');
const { imageToPromptService, getImageToPromptConversationHistoryService } = require("../service/ImagetoPromptService");

// Multer configuration for in-memory storage, image type and size validation
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        console.log("running fileFilter");
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files allowed'), false);
        }
    }
});

// Controller for handling image-to-prompt requests
const imageToPromptController = async (req, res) => {
    try {

        console.log("running imageToPromptController");
        // Check if a file was uploaded
        if (!req.file) {
            co
            return res.status(400).json({ error: 'No image provided' });
        }

        if (req.file.size > 5 * 1024 * 1024) {
            return res.status(413).json({ error: 'Image size exceeds 5MB limit' });
        }

        const id = req?.user?.id || null;

        // Convert Buffer to integer array for Cloudflare AI API
        const imageArray = [...new Uint8Array(req.file.buffer)];


        // Call your service (should handle API logic & error)
        const result = await imageToPromptService(imageArray, id);

        return res.status(result.status).json({ result });
    } catch (error) {
        console.error("error in imageToPromptController:", error);
        return res.status(500).json({ error: "something went wrong in imageToPromptController" });
    }
};


const getImageToPromptConversationHistoryController = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { page, sort } = req.query;
        const result = await getImageToPromptConversationHistoryService(user_id, page, sort);
        return res.status(result.status).json({ result });
    } catch (error) {
        console.error("error in getImageToPromptConversationHistoryController:", error);
        return res.status(500).json({ error: "something went wrong in getImageToPromptConversationHistoryController" });
    }
}

// Export both upload middleware and controller
module.exports = {
    upload: upload.single('image'),
    imageToPromptController,
    getImageToPromptConversationHistoryController
};


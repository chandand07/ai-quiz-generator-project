// backend/routes/videoRoutes.js
const express = require('express');
const router = express.Router();
const videoProcessingController = require('../controllers/videoProcessingController');
const { upload } = require('../controllers/videoProcessingController'); // Import multer upload instance if defined in controller
const authController = require('../controllers/authController'); // Your existing auth controller

// If 'upload' is not exported directly because it's used as middleware:
// We'll need to access the multer instance differently or define it here.
// For simplicity, let's assume the controller exports the `uploadAndProcessVideo`
// and the route itself will use a multer instance defined for it.

const multer = require('multer');
const fs = require('fs');
const path = require('path');

const TEMP_VIDEO_UPLOADS_DIR = path.join(__dirname, '..', 'temp_video_uploads');
if (!fs.existsSync(TEMP_VIDEO_UPLOADS_DIR)) {
    fs.mkdirSync(TEMP_VIDEO_UPLOADS_DIR, { recursive: true });
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, TEMP_VIDEO_UPLOADS_DIR);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
    }
});
const videoUploadMiddleware = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Not a video file!'), false);
        }
    },
    limits: { fileSize: 1024 * 1024 * 500 } // 500MB limit
});


// Protected route for uploading and processing
router.post(
    '/video/upload',
    authController.protect, // Protect with authentication
    videoUploadMiddleware.single('videoFile'), // 'videoFile' must match the FormData key from frontend
    videoProcessingController.uploadAndProcessVideo
);

router.get(
    '/video/:videoId/status',
    authController.protect,
    videoProcessingController.getVideoStatus
);

router.get(
    '/video/:videoId/results',
    authController.protect,
    videoProcessingController.getVideoResults
);

module.exports = router;
// backend/controllers/videoProcessingController.js
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const Video = require('../models/video');
const TranscriptSegment = require('../models/Transcript');
const User = require('../models/User'); // Assuming you have User model for userId
const FormData = require('form-data');

// --- Multer Setup for Temporary Video Storage ---
const TEMP_VIDEO_UPLOADS_DIR = path.join(__dirname, '..', 'temp_video_uploads'); // Create this dir
if (!fs.existsSync(TEMP_VIDEO_UPLOADS_DIR)) {
    fs.mkdirSync(TEMP_VIDEO_UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, TEMP_VIDEO_UPLOADS_DIR);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_')); // Make filename unique
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('video/')) { // Basic video type check
            cb(null, true);
        } else {
            cb(new Error('Not a video file!'), false);
        }
    },
    limits: { fileSize: 1024 * 1024 * 500 } // Example: 500MB limit, adjust as needed for ~60min video
});


// --- Helper: Function to call Python AI Service ---
const PYTHON_AI_SERVICE_URL = 'http://127.0.0.1:8000'; // Your Python service URL

// --- Main Upload and Process Function ---
exports.uploadAndProcessVideo = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No video file uploaded.' });
    }
    if (!req.user || !req.user._id) { // Assuming auth middleware sets req.user
        fs.unlinkSync(req.file.path); // Clean up uploaded file
        return res.status(401).json({ message: 'User not authenticated.' });
    }

    const videoFilePath = req.file.path;
    const originalFilename = req.file.originalname;
    const userId = req.user._id;

    let videoRecord;

    try {
        // 1. Create Video Record in DB
        videoRecord = new Video({
            userId,
            originalFilename,
            status: 'uploaded'
        });
        await videoRecord.save();
        console.log(`Video record created: ${videoRecord._id}`);

        // --- Start processing (can be made async/background job later) ---

        // 2. Call Python service to transcribe
        videoRecord.status = 'transcribing';
        await videoRecord.save();
        console.log(`[${videoRecord._id}] Transcribing video...`);
        const form = new FormData(); 

        form.append('file', fs.createReadStream(videoFilePath), {
            filename: originalFilename, // Pass the original filename here
            // contentType: req.file.mimetype, // Optionally pass content type
        });

        const transcriptResponse = await axios.post(`${PYTHON_AI_SERVICE_URL}/transcribe`, form, {
            headers: {
                ...form.getHeaders() // Important for FormData with axios
            },
            maxContentLength: Infinity, // Important for large file uploads
            maxBodyLength: Infinity
        });

        if (transcriptResponse.status !== 200 || !transcriptResponse.data) {
            throw new Error('Transcription service failed or returned invalid data.');
        }

        const { full_transcript: fullTranscript, segments: whisperSegments } = transcriptResponse.data;
        videoRecord.fullTranscript = fullTranscript;
        console.log(`[${videoRecord._id}] Transcription successful. Full length: ${fullTranscript.length}`);

        // 3. Segment the transcript into ~5-minute chunks (300 seconds)
        videoRecord.status = 'segmenting';
        await videoRecord.save();
        console.log(`[${videoRecord._id}] Segmenting transcript...`);

        const fiveMinuteChunks = []; // To store {text, startTime, endTime} for MCQ gen
        const CHUNK_DURATION_SECONDS = 300; // 5 minutes
        let currentChunkText = "";
        let currentChunkStartTime = 0;
        let chunkIndex = 0;

        if (whisperSegments && whisperSegments.length > 0) {
            currentChunkStartTime = whisperSegments[0].start;

            for (const seg of whisperSegments) {
                // If adding this segment crosses the 5-min boundary for the current chunk
                // OR if it's the first segment of a new potential chunk after a boundary
                if ((seg.end - currentChunkStartTime > CHUNK_DURATION_SECONDS && currentChunkText) ||
                    (currentChunkText && seg.start >= currentChunkStartTime + CHUNK_DURATION_SECONDS) ) {
                    
                    fiveMinuteChunks.push({
                        text: currentChunkText.trim(),
                        startTime: currentChunkStartTime,
                        endTime: whisperSegments.find(s => s.text.endsWith(currentChunkText.trim().split(" ").pop()))?.end || (currentChunkStartTime + CHUNK_DURATION_SECONDS), // Approximate end
                        dbSegmentIndex: chunkIndex
                    });
                    
                    chunkIndex++;
                    currentChunkText = "";
                    currentChunkStartTime = seg.start; // Start new chunk from this segment's start
                }
                currentChunkText += seg.text + " ";
            }
            // Add any remaining text as the last chunk
            if (currentChunkText.trim()) {
                const lastSegmentEndTime = whisperSegments[whisperSegments.length -1].end;
                fiveMinuteChunks.push({
                    text: currentChunkText.trim(),
                    startTime: currentChunkStartTime,
                    endTime: lastSegmentEndTime,
                    dbSegmentIndex: chunkIndex
                });
            }
        } else {
            console.log(`[${videoRecord._id}] No Whisper segments found to process.`);
            // Handle case where full transcript exists but segments don't,
            // or fall back to rough word count segmentation if needed.
            // For now, we'll assume whisperSegments are present if transcription was successful.
        }
        console.log(`[${videoRecord._id}] Created ${fiveMinuteChunks.length} 5-minute (approx) text chunks.`);


        // 4. For each 5-minute chunk, generate MCQs
        videoRecord.status = 'generating_mcqs';
        await videoRecord.save();
        console.log(`[${videoRecord._id}] Generating MCQs for ${fiveMinuteChunks.length} chunks...`);

        for (const chunk of fiveMinuteChunks) {
            console.log(`[${videoRecord._id}] Requesting MCQs for chunk starting at ${chunk.startTime}s`);
            try {
                const mcqResponse = await axios.post(`${PYTHON_AI_SERVICE_URL}/generate_mcqs`, {
                    transcript_segment: chunk.text,
                    num_questions: 3 // Or make this configurable
                });

                if (mcqResponse.status === 200 && mcqResponse.data && mcqResponse.data.mcqs) {
                    const newSegmentDoc = new TranscriptSegment({
                        videoId: videoRecord._id,
                        segmentIndex: chunk.dbSegmentIndex,
                        startTimeSeconds: chunk.startTime,
                        endTimeSeconds: chunk.endTime,
                        text: chunk.text,
                        mcqs: mcqResponse.data.mcqs
                    });
                    await newSegmentDoc.save();
                    console.log(`[${videoRecord._id}] Saved MCQs for chunk ${chunk.dbSegmentIndex}`);
                } else {
                    console.warn(`[${videoRecord._id}] Failed to get MCQs for chunk ${chunk.dbSegmentIndex} or invalid response.`);
                }
            } catch (mcqError) {
                console.error(`[${videoRecord._id}] Error generating MCQs for chunk ${chunk.dbSegmentIndex}:`, mcqError.message);
                // Decide if you want to stop all processing or continue with other chunks
            }
        }

        // 5. Mark as completed
        videoRecord.status = 'completed';
        await videoRecord.save();
        console.log(`[${videoRecord._id}] Video processing completed successfully.`);

        res.status(200).json({
            message: 'Video processed successfully.',
            videoId: videoRecord._id,
            // You might want to return some initial data here
        });

    } catch (error) {
        console.error(`[${videoRecord ? videoRecord._id : 'N/A'}] Error in video processing pipeline:`, error.message);
        if (videoRecord) {
            videoRecord.status = 'failed';
            videoRecord.errorMessage = error.message.substring(0, 500); // Store a snippet of the error
            await videoRecord.save().catch(saveErr => console.error("Failed to save error status to video record", saveErr));
        }
        res.status(500).json({ message: 'Video processing failed.', error: error.message });
    } finally {
        // Clean up the temporarily uploaded video file from Node.js server
        if (fs.existsSync(videoFilePath)) {
            fs.unlink(videoFilePath, (err) => {
                if (err) console.error(`Error deleting temp video file ${videoFilePath}:`, err);
                else console.log(`Temp video file ${videoFilePath} deleted.`);
            });
        }
    }
};

// --- Other controller functions (e.g., to get video status, get results) ---

// Endpoint to get processing status of a video
exports.getVideoStatus = async (req, res) => {
    try {
        const video = await Video.findById(req.params.videoId).select('status originalFilename errorMessage uploadDate');
        if (!video) {
            return res.status(404).json({ message: 'Video not found.' });
        }
        res.status(200).json(video);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching video status.', error: error.message });
    }
};

// Endpoint to get the full transcript and segmented MCQs for a completed video
exports.getVideoResults = async (req, res) => {
    try {
        const videoId = req.params.videoId;
        const video = await Video.findById(videoId).select('originalFilename fullTranscript status');
        if (!video) {
            return res.status(404).json({ message: 'Video not found.' });
        }
        if (video.status !== 'completed') {
            return res.status(400).json({ message: 'Video processing not yet complete.', status: video.status });
        }

        const segmentsWithMcqs = await TranscriptSegment.find({ videoId: videoId }).sort({ segmentIndex: 1 });

        res.status(200).json({
            videoInfo: video,
            processedSegments: segmentsWithMcqs
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching video results.', error: error.message });
    }
};
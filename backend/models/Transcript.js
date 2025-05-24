const mongoose = require('mongoose');
const transcriptSegmentSchema = new mongoose.Schema({
      videoId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Video',
          required: true
      },
      segmentIndex: { // 0, 1, 2... for the 5-min chunks
          type: Number,
          required: true
      },
      startTimeSeconds: { // Start time of this ~5-min chunk
          type: Number,
          required: true
      },
      endTimeSeconds: {   // End time of this ~5-min chunk
          type: Number,
          required: true
      },
      text: {
          type: String,
          required: true
      },
      mcqs: [{ // Array of MCQs for this segment
          question: String,
          options: [String], // Should be array of 4 strings
          correctOptionIndex: Number // 0-3
      }]
  }, { timestamps: true });

  // Index for faster querying by videoId and segmentIndex
  transcriptSegmentSchema.index({ videoId: 1, segmentIndex: 1 });

  const TranscriptSegment = mongoose.model('TranscriptSegment', transcriptSegmentSchema);
  module.exports = TranscriptSegment;

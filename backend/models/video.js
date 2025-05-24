  const mongoose = require('mongoose');
  const videoSchema = new mongoose.Schema({
      userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
      },
      originalFilename: {
          type: String,
          required: true
      },
    
      status: {
          type: String,
          enum: ['uploaded', 'transcribing', 'segmenting', 'generating_mcqs', 'completed', 'failed'],
          default: 'uploaded'
      },
      errorMessage: String, 
      uploadDate: {
          type: Date,
          default: Date.now
      },
      fullTranscript: {
          type: String
      },
      
  }, { timestamps: true });

  const Video = mongoose.model('Video', videoSchema);
  module.exports = Video;
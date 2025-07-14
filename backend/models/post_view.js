const mongoose = require('mongoose');

const viewSchema = new mongoose.Schema({
    
  postId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Article', 
    required: true 
    },
  ip: { 
    type: String, 
    required: true 
    },
  lastViewedAt: { 
    type: Date, 
    default: Date.now 
    }
});

viewSchema.index({ postId: 1, ip: 1 }, { unique: true });

module.exports = mongoose.model('PostView', viewSchema);

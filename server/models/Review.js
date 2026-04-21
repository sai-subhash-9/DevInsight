const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  snippet: { type: mongoose.Schema.Types.ObjectId, ref: 'Snippet', required: true },
  summary: { type: String, required: true },
  issues: [{ type: String }],
  suggestions: [{ type: String }],
  complexity: { type: String, default: 'N/A' },
  timeComplexity: { type: String, default: 'N/A' },
  spaceComplexity: { type: String, default: 'N/A' },
  score: { type: Number, default: 0, min: 0, max: 100 },
  type: { type: String, enum: ['ai', 'rule-based'], default: 'rule-based' }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);

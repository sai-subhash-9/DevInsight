const mongoose = require('mongoose');

const snippetSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  code: { type: String, required: true },
  language: { type: String, default: 'javascript', trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Snippet', snippetSchema);

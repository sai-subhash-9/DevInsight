const Review = require('../models/Review');
const Snippet = require('../models/Snippet');
const Project = require('../models/Project');
const { analyzeCode } = require('../services/aiService');

exports.createReview = async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.snippetId);
    if (!snippet) return res.status(404).json({ message: 'Snippet not found' });

    // Verify ownership
    const project = await Project.findOne({ _id: snippet.project, user: req.user.id });
    if (!project) return res.status(403).json({ message: 'Not authorized' });

    const analysis = await analyzeCode(snippet.code, snippet.language);

    const review = await Review.create({
      snippet: snippet._id,
      summary: analysis.summary,
      issues: analysis.issues,
      suggestions: analysis.suggestions,
      complexity: analysis.complexity,
      timeComplexity: analysis.timeComplexity,
      spaceComplexity: analysis.spaceComplexity,
      score: analysis.score,
      type: analysis.type
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ snippet: req.params.snippetId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

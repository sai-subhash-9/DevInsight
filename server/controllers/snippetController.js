const Snippet = require('../models/Snippet');
const Project = require('../models/Project');
const Review = require('../models/Review');

exports.createSnippet = async (req, res) => {
  try {
    const { projectId, code, language } = req.body;
    if (!projectId || !code) {
      return res.status(400).json({ message: 'Project ID and code are required' });
    }

    // Verify project belongs to user
    const project = await Project.findOne({ _id: projectId, user: req.user.id });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const snippet = await Snippet.create({ project: projectId, code, language });
    res.status(201).json(snippet);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getSnippets = async (req, res) => {
  try {
    // Verify project belongs to user
    const project = await Project.findOne({ _id: req.params.projectId, user: req.user.id });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const snippets = await Snippet.find({ project: req.params.projectId }).sort({ createdAt: -1 });
    res.json(snippets);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateSnippet = async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) return res.status(404).json({ message: 'Snippet not found' });

    // Verify ownership via project
    const project = await Project.findOne({ _id: snippet.project, user: req.user.id });
    if (!project) return res.status(403).json({ message: 'Not authorized' });

    const updated = await Snippet.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteSnippet = async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) return res.status(404).json({ message: 'Snippet not found' });

    const project = await Project.findOne({ _id: snippet.project, user: req.user.id });
    if (!project) return res.status(403).json({ message: 'Not authorized' });

    await Review.deleteMany({ snippet: snippet._id });
    await Snippet.findByIdAndDelete(req.params.id);
    res.json({ message: 'Snippet deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

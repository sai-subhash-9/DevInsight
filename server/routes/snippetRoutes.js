const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createSnippet, getSnippets, updateSnippet, deleteSnippet } = require('../controllers/snippetController');

router.use(auth);
router.post('/', createSnippet);
router.get('/:projectId', getSnippets);
router.put('/:id', updateSnippet);
router.delete('/:id', deleteSnippet);

module.exports = router;

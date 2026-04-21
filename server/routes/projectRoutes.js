const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createProject, getProjects, updateProject, deleteProject } = require('../controllers/projectController');

router.use(auth);
router.post('/', createProject);
router.get('/', getProjects);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

module.exports = router;

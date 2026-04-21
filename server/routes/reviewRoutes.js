const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createReview, getReviews, deleteReview } = require('../controllers/reviewController');

router.use(auth);
router.post('/:snippetId', createReview);
router.get('/:snippetId', getReviews);
router.delete('/:id', deleteReview);

module.exports = router;

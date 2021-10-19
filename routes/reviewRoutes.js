const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

// POST /tour/12334dsfe/reviews -- with the parameter above all routes /reviews will be merged like
// POST /reviews

// GET /tour/12334dsfe/reviews -- to set nested get route we have to do some changes in controller function

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.addReview
  );

router.route('/:id')
      .get(reviewController.getReview)
      .patch(
        authController.restrictTo('user', 'admin'),
        reviewController.updateReview
      )
      .delete(
        authController.restrictTo('user', 'admin'),
        reviewController.deleteReview
      );

module.exports = router;

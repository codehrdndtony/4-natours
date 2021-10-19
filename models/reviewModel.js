const mongoose = require('mongoose');
const Tour = require('../models/tourModel');

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, 'Review can not be empty!']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Review must belong to a tour']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Must belong to a user']
  }
},
{
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

reviewSchema.index({tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function(next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name'
  // }).populate({
  //   path: 'user',
  //   select: 'name photo'
  // });

  this.populate({
    path: 'user',
    select: 'name photo'
  });

  next();
});

reviewSchema.statics.calcAverageRatings = async function(tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  // console.log(stats);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

reviewSchema.post('save', function() {
  // this points to current review - next inside next dont work because post middleware does not get access to 'next'. use for 'pre.' only
  this.constructor.calcAverageRatings(this.tour); // this.constructor - points to a current module
  // called as constructor to workaround query with a Review.calc... because 'Review' variable is not defined
  // The obvious solution is to move code after 'const Review = mongoose...', but it wont work, because we need a query and reviewSchema won't contain this middleware
  // it will be executed afterwards.
});

// findByIdAndUpdate
// findByIdAndDelete - this two does not have document middleware. they have query middleware.
// And we do not have direct access in a query to a document. And workaround is below
reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne(); // ACCESS to the document (by created property inside of the query??)
  //console.log(this.r);
  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  // this.r = await this.findOne(); does NOT work here, query has already executed
  await this.r.constructor.calcAverageRatings(this.r.tour); // calcAvg... is a static method and should be called on a model
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

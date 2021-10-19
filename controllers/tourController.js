const Tour = require('./../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');
//const APIFeatures = require('./../utils/apiFeatures');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-rating,price';
  req.query.fields = 'name,price,rating,summary,difficulty';
  next();
};

exports.getAllTours = factory.getAll(Tour);
  /*
  catchAsync(async (req, res, next) => {

    //BUILD QUERY
    // 1A) Filtering
    // const queryObj = { ...req.query }
    // const excludedFields = ['page', 'sort', 'limit', 'fields'];
    // excludedFields.forEach(el => delete queryObj[el])
    //
    // // 1B) Advanced filtering
    // let queryStr = JSON.stringify(queryObj);
    // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    //
    // let query = Tour.find(JSON.parse(queryStr));

    // 2) Sorting
    // if(req.query.sort) {
    //   const sortBy = req.query.sort.split(',').join(' ');
    //   query = query.sort(sortBy);
    //   // sort('price ratingsAverage')
    // } else {
    //     query = query.sort('-createdAt');
    // }

    //3) Field limiting - link with ?fields=....

    // if (req.query.fields) {
    //   const fields = req.query.fields.split(',').join(' ');
    //   query = query.select(fields);
    // } else {
    //   query = query.select('-__v')
    // }

    // 4) Pagination
    // const page= req.query.page * 1 || 1;
    // const limit = req.query.limit * 1 || 100;
    // const skip = (page -1) * limit;
    //
    // query = query.skip(skip).limit(limit);
    //
    // if (req.query.page) {
    //   const numTours = await Tour.countDocuments();
    //   if(skip > numTours) throw new Error('This page does not exists')
    // }

    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;
    // query.sort().select().skip().limit()

    // const query = await Tour.find()
    //   .where('duration').equals(5)
    //   .where('difficulty').equals('easy');

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: tours.length,
      data: {
        tours: tours
      }
    });
});
*/

exports.getTour = factory.getOne(Tour, { path: 'reviews' });

// exports.createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);
//
//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour
//     }
//   });
//
//   // try {
//   //   // const newTour = new Tour({});
//   //   // newTour.save()
//   //
//   // } catch (err) {
//   //   res.status(400).json({
//   //     status: 'fail',
//   //     message: err//"Invalid data send!!" // should be replaced with error type
//   //   })
//   // }
//
// });

exports.createTour = factory.createOne(Tour)
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

// exports.deleteTour = catchAsync( async (req, res, next) => {
//     const tour = await Tour.findByIdAndDelete(req.params.id, req.body);
//
//   if(!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }
//
//     res.status(204).json({
//       status: 'success',
//       data: null
//     })
// });

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.1 } }
      },
      {
        $group: {
          _id: {$toUpper: '$difficulty'}, // id can use parameter to aggregate by group
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity'},
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      },
      {
        $sort: { avgPrice: 1 }
      }
      // {
      //   $match: { _id: { $ne: 'EASY' } }
      // }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    })
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates'
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' }
        }
      },
      {
        $addFields: { month: '$_id' }
      },
      {
        $project: {
          _id: 0
        }
      },
      {
        $sort: { numTourStarts: -1 }
      },
      {
        $limit: 12
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan
      }
    });
});

// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/233/center/34.111745,-118.113491/unit/mi

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const {distance, latlng, unit} = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please, provide latitude and longtitude in the format lat,lng',
        400
      )
    )
  }
  //console.log(distance, lat, lng, unit);

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit} = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please, to get DISTANCES provide latitude and longtitude in the format lat,lng',
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat *1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        name: 1,
        distance: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    // results: distances.length,
    data: {
      data: distances
    }
  })
});



// **** --- ****
// exports.checkID = (req, res, next, val) => {
//   console.log(`Tour id is: ${val}`);
//
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID'
//     });
//   }
//   next();
// };


// *** For file record

// exports.createTour = (req, res) => {
//   const newId = tours[tours.length - 1].id + 1;
//   const newTour = Object.assign({id: newId}, req.body);
//
//   tours.push(newTour);
//   fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
//     res.status(201).json({
//       status: 'success',
//       data: {
//         tour: newTour
//       }
//     });
//   });
// };



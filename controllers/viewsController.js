const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
    // 1) Get tour data from collection
    const tours = await Tour.find();

    // 2) Build template - not in controller function ))
    // 3) Render that template using tour data from step 1

    res.status(200).render('overview', {
      title: 'All Tours',
      tours
    });
});

exports.getTour = (req, res) => {
  // 1) Get data for the requested tour (incl reviews and guides)
  // 2) Build template
  // 3) Render the template using data from UI
    res.status(200).render('tour', {
      title: 'The Forest Hiker Tour'
    });
};

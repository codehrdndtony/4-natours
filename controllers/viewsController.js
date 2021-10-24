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

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get data for the requested tour (incl reviews and guides)
  const tour = await Tour.findOne({slug: req.params.slug}).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  // 2) Build template
  // 3) Render the template using data from UI
    res.status(200)
       .set(
         'Content-Security-Policy',
         "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
       )
       .render('tour', {
      title: `${tour.name} Tour`,
      tour
    });
});
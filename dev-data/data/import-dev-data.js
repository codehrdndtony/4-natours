const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DB_LINK.replace(
  '<PASSWORD>',
  process.env.DB_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  }).then(con => {
  //console.log(con.connections);
  console.log('DB connection successful!');
});

// READ JSON
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

//IMPORT data into DB
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data succesfully loaded!')

  } catch(err) {
    console.log(err)
  }
  process.exit();
};

//DELETE ALL DATA FROM COLLECTION
const deleteData = async  () => {
  try {
    await Tour.deleteMany();
    console.log('Data successfully loaded!')

  } catch(err) {
    console.log(err)
  }
  process.exit();
};

if(process.argv[2] === '--import') {
  importData()
} else if (process.argv[2] === '--delete') {
  deleteData();
}

console.log(process.argv);

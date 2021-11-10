const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = require('./app');
//console.log(process.env);

//const DB = process.env.DB_LINK.replace('<PASSWORD>', process.env.DB_PASSWORD);
const DB = process.env.DB_LINK;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    debug: true
}).then(con => {
  console.log('DB connection successful!');
}).catch(err => console.log('DB ERROR')); // = handles unhandled promise rejection. Done globally

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION -- Shutting down...');
  // console.log(err.name, err.message.match(/MongoError:.*/gm)[0]);
  server.close(() => {
    process.exit(1);
  })
});

process.on('uncaughtException', err => {
  console.log('unCAUGHT EXCEPTION -- Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  })
});

process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log(' >!!< Process terminated!');
  });
});




// ***** LOCAL connection version *****
// mongoose
//   .connect(process.env.DB_LOCAL, {
//     ....
//   })

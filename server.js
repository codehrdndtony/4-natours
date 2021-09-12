const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = require('./app');
//console.log(process.env);

const DB = process.env.DB_LINK.replace('<PASSWORD>', process.env.DB_PASSWORD)

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(con => {
  //console.log(con.connections);
  console.log('DB connection successful!');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});






// ***** LOCAL connection version *****
// mongoose
//   .connect(process.env.DB_LOCAL, {
//     ....
//   })
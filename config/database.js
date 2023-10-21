const mongoose = require('mongoose');

mongoose.set('strictQuery', true);
const dbConnection = () => {
  mongoose.connect(process.env.DB_URI).then((conn) => {
    console.log(`Database connected: ${conn.connection.host}`);
  });
};

module.exports = dbConnection;

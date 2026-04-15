const mongoose = require('mongoose');

const connectDB = async (mongoUri) => {
  await mongoose.connect(mongoUri, {
    autoIndex: true
  });
};

module.exports = connectDB;

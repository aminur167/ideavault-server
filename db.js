const mongoose = require('mongoose');

let connectionPromise;

function connectDatabase() {
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose.connection);
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 })
      .catch((error) => {
        connectionPromise = undefined;
        throw error;
      });
  }
  return connectionPromise;
}

module.exports = connectDatabase;

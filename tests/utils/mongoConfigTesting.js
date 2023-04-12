const mongoose = require('mongoose');
// eslint-disable-next-line import/no-extraneous-dependencies
const { MongoMemoryServer } = require('mongodb-memory-server');

const mongodbServer = new MongoMemoryServer();

const dbConnect = async () => {
  const mongodbUri = await mongodbServer.getUri();

  await mongoose.connect(mongodbUri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });
};

const dbDisconnect = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongodbServer.stop();
};

module.exports = {
  dbConnect,
  dbDisconnect,
};

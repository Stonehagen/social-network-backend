const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');

const routes = require('./routes');
require('./config/passport');

// eslint-disable-next-line operator-linebreak
const mongoDB = process.env.MONGODB_URI;
mongoose.connect(mongoDB, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
// eslint-disable-next-line no-console
db.on('error', console.error.bind(console, 'mongo connection error'));

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/user', routes.user);
app.use('/post', routes.post);

// eslint-disable-next-line arrow-body-style
app.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  return console.log(`app listening on port ${process.env.PORT}!`);
});

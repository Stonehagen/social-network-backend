const axios = require('axios');
const mongoose = require('mongoose');
const { User, Profile } = require('./models');
require('dotenv/config');

// eslint-disable-next-line operator-linebreak
const mongoDB = process.env.MONGODB_URI;
mongoose.connect(mongoDB, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
// eslint-disable-next-line no-console
db.on('error', console.error.bind(console, 'mongo connection error'));

let profiles;

axios.get('https://randomuser.me/api/?results=10').then((res) => {
  profiles = res.data.results.map((result) => {
    const profile = new Profile({
      firstName: result.name.first,
      lastName: result.name.last,
    });
    return profile;
  });
});



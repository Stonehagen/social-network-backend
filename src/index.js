const express = require('express');
const cors = require('cors');
require('dotenv/config');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// eslint-disable-next-line arrow-body-style
app.listen(process.env.PORT, () => {
  return console.log(`app listening on port ${process.env.PORT}!`);
});

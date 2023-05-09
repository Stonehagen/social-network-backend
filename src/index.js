const cors = require('cors');
const mongoose = require('mongoose');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
require('dotenv/config');
require('./config/passport');

// eslint-disable-next-line operator-linebreak
const mongoDB = process.env.MONGODB_URI;
mongoose.connect(mongoDB, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
// eslint-disable-next-line no-console
db.on('error', console.error.bind(console, 'mongo connection error'));

const app = express();
const httpServer = http.createServer(app);
const io = socketIO(httpServer, {
  cors: {
    origin: process.env.ORIGIN,
  },
});
io.on('connection', (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);
  socket.on('disconnect', () => {
    console.log('🔥: A user disconnected');
  });
});

const routes = require('./routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/user', routes.user);
app.use('/post', routes.post);
app.use('/session', routes.session);
app.use('/profile', routes.profile);
app.use('/comment', routes.comment);

app.use('/images', express.static('images'));
app.use('/img', express.static('img'));

// eslint-disable-next-line arrow-body-style
httpServer.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  return console.log(`app listening on port ${process.env.PORT}!`);
});

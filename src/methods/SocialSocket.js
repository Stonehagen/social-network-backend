/* eslint-disable no-console */
const profiles = {};

exports.SocialSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);

    socket.on('setSocketId', (data) => {
      profiles[data.profileId] = data.socketId;
      console.log(profiles);
    });

    socket.on('chat message', (receiver, room) => {
      if (profiles[receiver]) {
        socket.to(profiles[receiver]).emit('private message', room);
      }
    });

    socket.on('disconnect', () => {
      console.log('🔥: A user disconnected');
    });
  });
};

const profiles = {};

exports.SocialSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);

    socket.once('setSocketId', (data) => {
      profiles[data.profileId] = data.socketId;
      console.log(profiles);
    });

    socket.once('chat message', ({ sender, receiver }) => {
      if (profiles[receiver]) {
        socket
          .to(profiles[receiver])
          .emit('private message', {});
      }
    });

    socket.on('disconnect', (socket) => {
      console.log('🔥: A user disconnected');
    });
  });
};

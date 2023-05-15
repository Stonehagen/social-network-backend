const profiles = {};

exports.SocialSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);
    socket.on('setSocketId', (data) => {
      profiles[data.profileId] = data.socketId;
      console.log(profiles);
    });
    socket.on('chat message', (msg) => {
      console.log(`message: ${msg}`);
    });
    socket.on('disconnect', (socket) => {
      console.log(profiles);
      // eslint-disable-next-line no-restricted-syntax
      for (const [profileId, sockedId] of Object.entries(profiles)) {
        if (sockedId === socket.id) {
          delete profiles[profileId];
        }
      }
      console.log(profiles);
      console.log('🔥: A user disconnected');
    });
  });
};

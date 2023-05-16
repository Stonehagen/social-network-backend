const profiles = {};

exports.SocialSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);

    socket.on('setSocketId', (data) => {
      profiles[data.profileId] = data.socketId;
      console.log(profiles);
    });

    socket.on('chat message', ({ profileId, message }) => {
      console.log(`message: ${message} sender: ${profileId}`);
      //save Message in MongoDB
      //if user online send message via socket to user
      //else, set a notification
    });

    socket.on('disconnect', (socket) => {
      console.log('🔥: A user disconnected');
    });
  });
};

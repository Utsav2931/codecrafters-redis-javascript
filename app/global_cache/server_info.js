const serverInfo = {
  role: "",
  master: {
    replica_connection: [], // To store all the connection to different replicas so it can propogate commands
  },
  slave: {
    offset: 0,
  },
};

module.exports = { serverInfo };

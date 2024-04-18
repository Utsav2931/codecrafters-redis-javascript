const serverInfo = {
  role: "",
  master: {
    replica_connection: [], // To store all the connection to different replicas so it can propogate commands
    replica_count: 0,
  },
  slave: {
    offset: 0,
  },
};

module.exports = { serverInfo };

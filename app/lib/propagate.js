const net = require("net");
const { serverConf } = require("../global_cache/server_conf");
const { serverInfo } = require("../global_cache/server_info");

let server = null;

/**
 * Will propagate any write command to replica
 * @param {string} command - command to propagate to replica
 */
const propagateToReplica = (command) => {
  const connection = serverInfo.master["replica_connection"];
  connection.write(command, "utf8", () => {
    console.log(`Send ${JSON.stringify(command)} to replica`);
  });
};

module.exports = { propagateToReplica };

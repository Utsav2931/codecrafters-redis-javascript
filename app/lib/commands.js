const { cache } = require("../global_cache/cache");
const { serverInfo } = require("../global_cache/server_info");
const { propagateToReplica } = require("./propagate");
const { sendMessage } = require("./utils");

/**
 * Generates response array for info command
 * will parse everything into an array which is stored in serverInfo
 *
 * @returns {array} - Response args
 */
const info = () => {
  const currentRole = serverInfo["role"];
  let res = `role:${currentRole}`;
  if (currentRole === "master") {
    const masterObj = serverInfo["master"];
    for (const [key, value] of Object.entries(masterObj)) {
      res += `\n${key}:${value}`;
    }
  }
  return [res];
};

/**
 *
 * Ex. *3\r\n$3\r\nset\r\n$3\r\nkey\r\n$5\r\nvalue\r\n
 * args = ["$3", "key", "$5", "value"]
 * Or with expiry with px command
 * Ex. *5\r\n$3\r\nset\r\n$3\r\nkey\r\n$5\r\nvalue\r\n$2\r\npx\r\n$3\r\n100\r\n
 * args = ["$3", "key", "$5", "value", "$2", "px", "$3", "100"]
 * @param {args} args - Array of argument
 * @returns {Array} - Response arguments
 */
const set = (args) => {
  key = args[0];
  value = args[1];
  cache[key] = value;
  console.log(`Setting ${key} to ${value}`);
  if (args.length === 4) {
    if (args[2] === "px") {
      const delay = parseInt(args[3]);
      setTimeout(() => {
        console.log(`Deleting key: ${key}`);
        delete cache[key];
      }, delay);
    }
  }
  return ["+OK"];
};

// ignore for capa eof
// Ex. *3\r\n$8\r\nreplconf\r\n$14\r\nlistening-port\r\n$4\r\nxxxx\r\n
// args = ["listening-port", "xxxx"] etc.
/**
 * @param {array} args - Array of arguments
 * @param {socket} connection - Socket connection
 * @returns {array} - Response to send back
 * */
const replconf = (args, connection) => {
  let response;
  // Store the connection to replica in serverInfo.master
  if (args[0] === "listening-port") {
    serverInfo.master["replica_connection"].push(connection);
    serverInfo.master["replica_count"]++;
    response = ["+OK"];
  } else if (args[0] === "capa") {
    response = ["+OK"];
  } else if (args[0] === "GETACK") {
    // From replica to master
    response = ["*3", "REPLCONF", "ACK", `${serverInfo.slave["offset"]}`];
  } else if (args[0] === "ACK") {
    // Ack received from replica
    console.log("Ack received:");
    serverInfo.master.ack_received++;
    response = null;
  }
  return response;
};

/**
 * This command blocks the current client until all the previous write commands are
 * successfully transferred and acknowledged by at least the specified number of replicas.
 * If the timeout, specified in milliseconds, is reached, the command returns even if the specified number
 * of replicas were not yet reached.
 * Ex. *3\r\n$4\r\nWAIT\r\n$1\r\n1\r\n$3\r\n500\r\n
 * args: [1, 500]
 * @param {array} args - Array of argument
 * @param {socket} connection - Socket connection
 */
const wait = (args, connection) => {
  const noOfReplica = parseInt(args[0]);
  const delay = parseInt(args[1]);
  serverInfo.master.ack_received = 0;
  serverInfo.master.ack_needed = noOfReplica;
  serverInfo.master.reply_wait = false;
  if (serverInfo.master.propogated_commands === 0) {
    serverInfo.master.reply_wait = true;
    sendMessage(connection, [`:${serverInfo.master.replica_count}`]);
  } else {
    propagateToReplica("*3\r\n$8\r\nreplconf\r\n$6\r\nGETACK\r\n$1\r\n*\r\n")
  }
  setTimeout(() => {
    if (!serverInfo.master.reply_wait)
      sendMessage(connection, [`:${serverInfo.master.ack_received}`]);
  }, delay);
};

const replyWait = (connection) => {};

module.exports = { info, set, replconf, wait };

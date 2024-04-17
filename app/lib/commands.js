const { cache } = require("../global_cache/cache");
const { serverInfo } = require("../global_cache/server_info");

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
    response = ["+OK"];
  } else if (args[0] === "capa") {
    response = ["+OK"];
  } else if (args[0] === "GETACK") {
    response = ["*3", "REPLCONF", "ACK", "0"];
  }
  return response;
};

module.exports = { info, set, replconf };

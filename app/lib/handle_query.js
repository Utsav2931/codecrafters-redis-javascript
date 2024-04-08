const { cache } = require("./cache");
const { parseData, sendMessage } = require("./utils");

/**
 * Handles the incoming request from client and manages different commands based on parsed message.
 * @param {string} data - Message received from client
 * @param {*} connection - Socket connection to client
 */
const handleQuery = (data, connection) => {
  const { nParams, command, args } = parseData(data);
  console.log("Args:", args);
  console.log("Command", command);
  let key, value; // For get and set
  switch (command) {
    // Ex. *2\r\n$4\r\necho\r\n$3\r\nhey\r\n
    // args = ["$3", "hey"]
    case "echo":
      sendMessage(connection, args);
      // echo(connection, query);
      break;
    // Ex. *1\r\n$4\r\nping\r\n
    // args = []
    case "ping":
      sendMessage(connection, ["+PONG"]);
      break;
    // Ex. *3\r\n$3\r\nset\r\n$3\r\nkey\r\n$5\r\nvalue\r\n
    // args = ["$3", "key", "$5", "value"]
    // Or with expiry with px command
    // Ex. *5\r\n$3\r\nset\r\n$3\r\nkey\r\n$5\r\nvalue\r\n$2\r\npx\r\n$3\r\n100\r\n
    // args = ["$3", "key", "$5", "value", "$2", "px", "$3", "100"]
    case "set":
      key = args[1];
      value = args[3];
      cache[key] = value;
      console.log(`Setting ${key} to ${value}`);
      if (args.length === 8) {
        if (args[5] === "px") {
          const delay = parseInt(args[7]);
          setTimeout(() => {
            console.log(`Deleting key: ${key}`)
            delete cache[key];
          }, delay);
        }
      }
      sendMessage(connection, ["+OK"]);
      break;
    // Ex. *2\r\n$3\r\nget\r\n$3\r\nkey
    // args = ["$3", "key"]
    case "get":
      key = args[1];
      if (key in cache) sendMessage(connection, [cache[key]]);
      else sendMessage(connection, []);
  }
};

module.exports = { handleQuery };

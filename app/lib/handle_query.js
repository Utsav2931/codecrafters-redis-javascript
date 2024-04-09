const { cache } = require("./cache");
const { set } = require("./commands");
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
    case "set":
      const response = set(args);
      sendMessage(connection, response);
      break;
    // Ex. *2\r\n$3\r\nget\r\n$3\r\nkey
    // args = ["$3", "key"]
    case "get":
      key = args[1];
      if (key in cache) sendMessage(connection, [cache[key]]);
      else sendMessage(connection, []);
      break;
    case "info":
      sendMessage(connection, ["role:master"]);
  }
};

module.exports = { handleQuery };

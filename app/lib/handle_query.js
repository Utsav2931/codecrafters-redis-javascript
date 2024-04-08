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
  switch (command) {
    case "echo":
      sendMessage(connection, args);
      // echo(connection, query);
      break;
    case "ping":
      sendMessage(connection, ["+PONG"]);
      break;
  }
};

module.exports = { handleQuery };

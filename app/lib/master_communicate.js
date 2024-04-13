const { sendMessage } = require("./utils");

/**
 * Handles communication with the master 
 * @param {string} command - Command to send to master
 * @param {socket} connection - socket connection to master 
 */
const masterCommunicate = (command, connection) => {
  switch (command) {
    case "ping":
      sendMessage(connection, ["*1", "ping"]);
      break;
  }
};

module.exports = {masterCommunicate}
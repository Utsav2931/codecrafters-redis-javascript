const { masterCommunicate } = require("./master_communicate");

/**
 *
 * @param {string} data - data received from master as response
 * @param {socket} connection - socket connection to master
 */
const handleMasterRes = (data, connection) => {
  // Handshake ping response
  if (data === "+PONG\r\n") {
    // Send replconf command
    console.log("Received pong sending replconf");
    masterCommunicate("replconf", connection);
  }
};

module.exports = { handleMasterRes };

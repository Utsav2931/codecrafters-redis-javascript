const { handleQuery } = require("./handle_query");
const { masterCommunicate } = require("./master_communicate");

let okCount = 0;

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
  } else if (data === "+OK\r\n") {
    okCount += 1;
    // ack of second replconf command
    if (okCount === 2) {
      masterCommunicate("psync", connection);
    }
  } 
};

module.exports = { handleMasterRes };

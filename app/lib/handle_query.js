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
    case "echo":
      sendMessage(connection, args);
      // echo(connection, query);
      break;
    case "ping":
      sendMessage(connection, ["+PONG"]);
      break;
    case "set":
       key = args[1];
       value = args[3];
      cache[key] = value;
      console.log(`Setting ${key} to ${value}`);
      sendMessage(connection, ["+OK"])
      break;
    case "get":
      key = args[1];
      if(key in cache)
      sendMessage(connection, [cache[key]])
      else
      sendMessage(connection, [])
  }
};

module.exports = { handleQuery };

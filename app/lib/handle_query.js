const { cache } = require("../global_cache/cache");
const { serverInfo } = require("../global_cache/server_info");
const { set, info } = require("./commands");
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
  let response; // For response of any function from commands
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
      response = set(args);
      sendMessage(connection, response);
      break;
    // Ex. *2\r\n$3\r\nget\r\n$3\r\nkey
    // args = ["$3", "key"]
    case "get":
      key = args[0];
      if (key in cache) sendMessage(connection, [cache[key]]);
      else sendMessage(connection, []);
      break;
    case "info":
      response = info();
      sendMessage(connection, response);
      break;
    case "replconf":
      sendMessage(connection, ["+OK"]);
      break;
    case "psync":
      sendMessage(connection, [
        `+FULLRESYNC ${serverInfo["master"]["master_replid"]} ${serverInfo["master"]["master_repl_offset"]}`,
      ]);
      // Send an empty RDB file
      sendRDBFile(connection);
      break;
  }
};

/**
 * Sends an empty rdb file to replica 
 * @param {socket} connection - Socket connection  
 */
function sendRDBFile(connection) {
  const base64 =
      "UkVESVMwMDEx+glyZWRpcy12ZXIFNy4yLjD6CnJlZGlzLWJpdHPAQPoFY3RpbWXCbQi8ZfoIdXNlZC1tZW3CsMQQAPoIYW9mLWJhc2XAAP/wbjv+wP9aog==";
  const rdbBuffer = Buffer.from(base64, "base64");
  const rdbHead = Buffer.from(`$${rdbBuffer.length}\r\n`);
  sendMessage(connection,[Buffer.concat([rdbHead, rdbBuffer])], true);
}

module.exports = { handleQuery };

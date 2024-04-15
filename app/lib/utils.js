const { cache } = require("../global_cache/cache");
const { serverInfo } = require("../global_cache/server_info");

/**
 * To format string that needs to be returned
 * @param {array} args - Array of words to format
 * @param {bool} isRDB - if the message is a rdb file
 * @returns {string} - Formated string with \r\n between each word to follow RESP
 */
const formatMessage = (args) => {
  const formatedArgs = [];

  // If args is empty send null buld string
  if (args.length === 0) return "$-1\r\n";

  // Add ${len} of word before each word according to RESP
  for (let i = 0; i < args.length; i++) {
    if (args[i][0] === "+" || args[i][0] === "*") {
      formatedArgs.push(args[i]);
    } else if (args[i][0] != "$") {
      formatedArgs.push("$" + args[i].length.toString());
      formatedArgs.push(args[i]);
    } else {
      formatedArgs.push(args[i]);
      formatedArgs.push(args[i + 1]);
      i++;
    }
  }
  // To append the "\r\n" at end as join does not do it.
  // Dont add "\r\n" if it's rdbfile.
  return formatedArgs.join("\r\n") + "\r\n";
};

/**
 * To parse the incoming data to extract command and it's argument
 * @param {string} data - Message received from the client
 * @returns {nParams: string, comamnd: string, args: array of string}
 */
const parseData = (data) => {
  const [nParams, ...params] = data.split("\r\n");
  console.log("Params:", params);
  const command = params[1].toLowerCase();
  const args = [];
  for (let i = 2; i < params.length; i++) {
    if (params[i] === "" || params[i][0] === "$") continue; // To avoid adding $ as a parth of args as it's only length of next argument
    // Handle integer value ex. :100
    if (params[i][0] === ":") {
      args.push(params.substr(1));
      continue;
    }
    args.push(params[i]);
  }
  return { nParams, command, args };
};

/**
 * To send message back to client
 * @param {scoket} connection - Socket connection to client
 * @param {array} args - Array of string containing response
 * @param {bool} isRDB - (Optional) if message is a rdb file
 */
const sendMessage = (connection, args, isRDB = false) => {
  const formatedMessage = isRDB ? args[0] : formatMessage(args, isRDB);
  connection.write(formatedMessage, "utf8", () => {
    console.log(`Sent message ${JSON.stringify(formatedMessage)} to client`);
  });
};

/**
 * Sets role of the server in the serverInfo with necessary metadata
 * @param {string} role - Role of the server
 */
const setRole = (role) => {
  serverInfo["role"] = role;
  if (role === "master") {
    serverInfo["master"]["master_replid"] =
      "8371b4fb1155b71f4a04d3e1bc3e18c4a990aeeb";
    serverInfo["master"]["master_repl_offset"] = "0";
  }
};

module.exports = { parseData, sendMessage, setRole };

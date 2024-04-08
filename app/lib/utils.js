/**
 * To format string that needs to be returned
 * @param {array} args - Array of words to format
 * @returns {string} - Formated string with \r\n between each word to follow RESP
 */
const formatMessage = (args) => {
  const formatedArgss = [];

  // If args is empty send null buld string
  if (args.length === 0) return "$-1\r\n";

  // Add ${len} of word before each word according to RESP
  for (let i = 0; i < args.length; i++) {
    if (args[i][0] === "+") {
      formatedArgss.push(args[i]);
    } else if (args[i][0] != "$") {
      formatedArgss.push("$" + args[i].length.toString());
      formatedArgss.push(args[i]);
    } else {
      formatedArgss.push(args[i]);
      formatedArgss.push(args[i + 1]);
      i++;
    }
  }
  return formatedArgss.join("\r\n") + "\r\n"; // To append the "\r\n" at end as join does not do it.
};

/**
 * To parse the incoming data to extract command and it's argument
 * @param {string} data - Message received from the client
 * @returns {nParams: string, comamnd: string, args: array of string}
 */
const parseData = (data) => {
  const [nParams, ...params] = data.split("\r\n");
  console.log("Params:", params);
  const command = params[1];
  const args = [];
  for (let i = 2; i < params.length; i++) {
    if (params[i] === "") continue;
    args.push(params[i]);
  }
  return { nParams, command, args };
};

/**
 * To send message back to client
 * @param {scoket} connection - Socket connection to client
 * @param {array} args - Array of string containing response
 */
const sendMessage = (connection, args) => {
  const formatedMessage = formatMessage(args);
  connection.write(formatedMessage, "utf8", () => {
    console.log(`Sent message ${JSON.stringify(formatedMessage)} to client`);
  });
};

module.exports = { parseData, sendMessage };

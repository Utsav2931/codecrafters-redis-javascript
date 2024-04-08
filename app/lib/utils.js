/**
 * To format string that needs to be returned
 * @param {array} messages - Array of words to format
 * @returns {string} - Formated string with \r\n between each word to follow RESP
 */
const formatMessage = (messages) => {
  return messages.join("\r\n") + "\r\n"; // To append the "\r\n" at end as join does not do it.
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
 * @param {array} messages - Array of string containing response
 */
const sendMessage = (connection, messages) => {
  const formatedMessage = formatMessage(messages);
  connection.write(formatedMessage, "utf8", () => {
    console.log(`Sent message ${formatedMessage} to client`);
  });
};

module.exports = { parseData, sendMessage };

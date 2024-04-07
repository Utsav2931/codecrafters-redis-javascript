const echo = (connection, messages) => {
  console.log("Sending echo: ", messages.join("\r\n"));
  connection.write(messages.join("\r\n"), "utf8", () => {
    console.log("Sent echo message");
  });
};

module.exports = { echo };

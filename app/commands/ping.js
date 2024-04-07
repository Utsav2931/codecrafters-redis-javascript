const ping = (connection) => {
  connection.write("+PONG\r\n", "utf8", () => {
    console.log("Sent ping message");
  });
};

module.exports = {ping}

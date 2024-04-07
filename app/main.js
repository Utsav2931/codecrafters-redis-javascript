const net = require("net");
const { handleQuery } = require("./lib/handle_query");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this block to pass the first stage
const server = net.createServer((connection) => {
  // Handle connection
  connection.on("data", (data) => {
    const pong = "+PONG\r\n";
    handleQuery(data.toString(), connection);
    // connection.write(pong, "utf8", () => {
    //   console.log("Sent data back to client");
    // });
  });
});

server.listen(6379, "127.0.0.1");

const net = require("net");
const { handleQuery } = require("./lib/handle_query");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this block to pass the first stage
const server = net.createServer((connection) => {
  // Handle connection
  connection.on("data", (data) => {
    console.log("Unformated string", JSON.stringify(data.toString()));
    handleQuery(data.toString(), connection);
  });
});

if (process.argv.length === 2) server.listen(6379, "127.0.0.1");
else server.listen(process.argv[3], "127.0.0.1");

const net = require("net");
const { handleQuery } = require("./lib/handle_query");
const { setRole } = require("./lib/utils");

let port = 6379;

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

// Loop through all the flags passed to code
// node example.js -a -b -c
// process.argv = [
//   '/usr/bin/node',
//   '/path/to/example.js',
//   '-a',
//   '-b',
//   '-c'
// ]
let isSlave = false;

for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === "--port") {
    port = process.argv[i + 1];
    i++;
  }  
  // If --replicaof flag is present then the server is a slave server.
  else if (process.argv[i] === "--replicaof") {
    isSlave = true;
    setRole("slave");
  }
}

if (!isSlave) setRole("master");
server.listen(port, "127.0.0.1");


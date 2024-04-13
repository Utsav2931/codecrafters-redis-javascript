const net = require("net");
const { handleQuery } = require("./lib/handle_query");
const { setRole } = require("./lib/utils");
const { masterCommunicate } = require("./lib/master_communicate");

let port = 6379;

// To connect to master
let masterHost;
let masterPort;

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
// console.log("Argv:", process.argv);

for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === "--port") {
    port = process.argv[i + 1];
    i++;
  }
  // If --replicaof flag is present then the server is a slave server.
  else if (process.argv[i] === "--replicaof") {
    isSlave = true;
    masterHost = process.argv[i + 1];
    masterPort = process.argv[i + 2];
    console.log(`Masterhost: ${masterHost}, masterPort: ${masterPort}`);
    i += 2;
    setRole("slave");
  }
}

if (!isSlave) setRole("master");


/**
 * If the current server is a slave then handshake with master
 */
const handshakeToMaster = () => {
  console.log("In handshake");
  const replicaSocket = net.createConnection(masterPort, masterHost);

  replicaSocket.on("connect", () => {
    console.log("Handshake");
    masterCommunicate("ping", replicaSocket);
  });
};

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

server.listen(port, "127.0.0.1");

// If the server is slave send handshake to master
if (isSlave) {
  console.log("calling handshake");
  handshakeToMaster();
}
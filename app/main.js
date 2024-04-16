const net = require("net");
const { handleQuery } = require("./lib/handle_query");
const { setRole } = require("./lib/utils");
const { serverConf } = require("./global_cache/server_conf");
const { handleMasterMessage } = require("./lib/handle_master_res");
const { masterCommunicate } = require("./lib/master_communicate");

// Loop through all the flags passed to code
// node example.js -a -b -c
// process.argv = [
//   '/usr/bin/node',
//   '/path/to/example.js',
//   '-a',
//   '-b',
//   '-c'
// ]
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === "--port") {
    serverConf.port = process.argv[i + 1];
    i++;
  }
  // If --replicaof flag is present then the server is a slave server.
  else if (process.argv[i] === "--replicaof") {
    serverConf.isSlave = true;
    serverConf.masterHost = process.argv[i + 1];
    serverConf.masterPort = process.argv[i + 2];
    console.log(
      `Masterhost: ${serverConf.masterHost}, masterPort: ${serverConf.masterPort}`
    );
    i += 2;
    setRole("slave");
  }
}

if (!serverConf.isSlave) setRole("master");

/**
 * If the current server is a slave then handshake with master
 */
const connectToMaster = () => {
  const replicaSocket = net.createConnection(
    serverConf.masterPort,
    serverConf.masterHost
  );

  // Handshake
  replicaSocket.on("connect", () => {
    masterCommunicate("ping", replicaSocket);
  });

  replicaSocket.on("data", (data) => {
    handleMasterMessage(data.toString(), replicaSocket);
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

server.listen(serverConf.port, "127.0.0.1");

// If the server is slave send handshake to master
if (serverConf.isSlave) {
  connectToMaster();
}

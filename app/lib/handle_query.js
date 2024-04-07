const { echo } = require("../commands/echo");
const { ping } = require("../commands/ping");
const { parseData } = require("./parser");

const handleQuery = (data, connection) => {
	console.log("Data:",data)
  const {nParams, command, query} = parseData(data);
  console.log("Query:", query);
	console.log("Command", command)
  switch (command) {
    case "echo":
      echo(connection, query);
			break;
		case "ping":
			ping(connection);
			break;
  }
};

module.exports = { handleQuery };

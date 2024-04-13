const { cache } = require("../global_cache/cache");
const { serverInfo } = require("../global_cache/server_info");

/**
 * Generates response array for info command
 * will parse everything into an array which is stored in serverInfo
 *
 * @returns {array} - Response args
 */
const info = () => {
  const currentRole = serverInfo["role"];
  let res = `role:${currentRole}` 
  if (currentRole === "master") {
    const masterObj = serverInfo["master"];
    for (const [key, value] of Object.entries(masterObj)) {
      res += `\n${key}:${value}`
    }
  }
  return [res];
};

/**
 *
 * Ex. *3\r\n$3\r\nset\r\n$3\r\nkey\r\n$5\r\nvalue\r\n
 * args = ["$3", "key", "$5", "value"]
 * Or with expiry with px command
 * Ex. *5\r\n$3\r\nset\r\n$3\r\nkey\r\n$5\r\nvalue\r\n$2\r\npx\r\n$3\r\n100\r\n
 * args = ["$3", "key", "$5", "value", "$2", "px", "$3", "100"]
 * @param {args} args - Array of argument
 * @returns {Array} - Response arguments
 */
const set = (args) => {
  key = args[0];
  value = args[1];
  cache[key] = value;
  console.log(`Setting ${key} to ${value}`);
  if (args.length === 4) {
    if (args[2] === "px") {
      const delay = parseInt(args[3]);
      setTimeout(() => {
        console.log(`Deleting key: ${key}`);
        delete cache[key];
      }, delay);
    }
  }
  return ["+OK"];
};

module.exports = { info, set };

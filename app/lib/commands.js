const { cache } = require("./cache");

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
  key = args[1];
  value = args[3];
  cache[key] = value;
  console.log(`Setting ${key} to ${value}`);
  if (args.length === 8) {
    if (args[5] === "px") {
      const delay = parseInt(args[7]);
      setTimeout(() => {
        console.log(`Deleting key: ${key}`);
        delete cache[key];
      }, delay);
    }
  }
  return ["+OK"];
};

module.exports = { set };

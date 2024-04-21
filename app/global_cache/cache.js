const cache = {};

const expiry = {}; // Will store unix timestamp for expiry of a key from .rdb file

module.exports = { cache, expiry };

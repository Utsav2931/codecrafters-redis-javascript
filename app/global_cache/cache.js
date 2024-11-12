const cache = {};

const multi = {
	isMulti: false,
	commandQuquq: [],
}

const expiry = {}; // Will store unix timestamp for expiry of a key from .rdb file

module.exports = { cache, expiry, multi };

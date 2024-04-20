const fs = require("fs");
const { serverConf } = require("../global_cache/server_conf");
const { cache } = require("../global_cache/cache");

/**
 * Reads rdb binary file and stores key value pairs in cache.
 * */
const readRdbFile = () => {
  const opCodes = {
    resizeDb: "fb",
    miliExp: "fc",
  };
  let i = 0;
  const dirName = serverConf.rdb_dir;
  const fileName = serverConf.rdb_file;
  const filePath = dirName + "/" + fileName;
  let dataBuffer;
  try {
    dataBuffer = fs.readFileSync(filePath);
  } catch (e) {
    console.log("Error:", e);
    return;
  }
  console.log("Hex data:", dataBuffer.toString("hex"));

  /**
   * @param {int} n - No. Of bytes to get
   * @returns {Buffer} - Next n bytes
   * */
  const getNextNBytes = (n) => {
    let nextNBytes = Buffer.alloc(n);

    for (let k = 0; k < n; k++) {
      nextNBytes[k] = dataBuffer[i];
      i++;
    }

    return nextNBytes;
  };

  const getNextObjLength = () => {
    const firstByte = dataBuffer[i];
    const twoBits = firstByte >> 6;
    let length = 0;
    switch (twoBits) {
      case 0b00:
        length = firstByte ^ 0b00000000;
        i++;
        break;
    }
    return length;
  };

  const getUnixTime = () => {
    i++; // as i is pointing to "fc"
    let timeStamp = getNextNBytes(8)
      .toString("hex")
      .split("")
      .reverse()
      .join(""); // Reversing timeStamp because it's in litle endian.
    i++; // 00 Padding
		timeStamp = "0x" + timeStamp;
		console.log("Timestamp in hex:")
    return Number(timeStamp);
  };

  const getKeyValues = (n) => {
    let expiryTime = "";
    for (let j = 0; j < n; j++) {
      if (dataBuffer[i].toString(16) === opCodes.miliExp) {
        expiryTime = getUnixTime();
        console.log("expiryTime:", expiryTime);
      }
      const keyLength = getNextObjLength();
      const key = getNextNBytes(keyLength).toString();
      const valueLength = getNextObjLength();
      const value = getNextNBytes(valueLength).toString();
      console.log(`Setting ${key} to ${value}`);
      cache[key] = value;
      if (expiryTime) {
        cache["exp"][key] = expiryTime;
      }
      i++; // 00 padding.
    }
  };

  const resizeDb = () => {
    console.log("Inside resizedb");
    i++;
    const totalKeyVal = getNextObjLength();
    const totalExpiry = getNextObjLength();
    if (totalExpiry === 0) i++; // There is 00 padding.

    getKeyValues(totalKeyVal);
  };

  while (i < dataBuffer.length) {
    const currentHexByte = dataBuffer[i].toString(16);
    if (currentHexByte === opCodes.resizeDb) resizeDb();
    i++;
  }

  return null;
};

module.exports = { readRdbFile };

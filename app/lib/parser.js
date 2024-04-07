const parseData = (data) => {
  const [nParams, ...params] = data.split("\r\n");
  console.log("Params:", params);
	const command = params[1];
	const query = [];
	for (let i = 2; i < params.length; i++) {
		query.push(params[i])
	}
	return {nParams, command, query}
};

module.exports = {parseData}

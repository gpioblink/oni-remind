const lambda = require("./handler.js");

(async () => {
    const res = await lambda.handler({type: process.argv[2]});
    console.log(res.data);
})();
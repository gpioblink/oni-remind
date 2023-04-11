const lambda = require("./handler.js");

(async () => {
    const res = await lambda.handler(null);
    console.log(res.data);
})();
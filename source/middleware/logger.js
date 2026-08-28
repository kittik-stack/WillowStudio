const fs = require("fs");

function logger(req, res, next) {
    const now = new Date();
  const hour = now.getHours();
    const min = now.getMinutes();
    const sec = now.getSeconds();
    const data = `${hour}:${min}:${sec} ${req.method} ${req.url}`;
    
    fs.appendFile("server.log", data + "\n", (error) => {
        if (error) console.log(error);
    });
    next();
}

module.exports = logger;
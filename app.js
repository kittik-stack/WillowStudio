const express = require("express");
const app = express();

const PORT = 3000;
const HOST = "localhost";

//middleware
app.use((req, res, next) => { 
    console.log(`${req.method} ${req.url}`);
    next();
});
app.use(express.static('public'));


app.get("/", (req, res) => {
    res.send("Приветик кошечки");
});

app.get("/catalog", (req, res) => {
    res.send(" и коты");
});

app.listen(PORT, () => {
    console.log(`try server on http://${HOST}:${PORT}`);
});
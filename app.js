const express = require("express");
const app = express();

const PORT = 3000;
const HOST = "localhost";

app.get("/", (req, res) => {
    res.send("Приветик кошечки");
});

app.get("/catalog", (req, res) => {
    res.send(" и коты");
});

app.listen(PORT, () => {
    console.log(`try server on http://${HOST}:${PORT}`);
});
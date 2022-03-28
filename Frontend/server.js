const express = require("express");
var forceSSL = require('force-ssl-heroku');

const app = express();
app.use(forceSSL);
app.use(express.static("./dist/Mister-Blog"));

app.get("/*", function (req, res) {
    res.sendFile("index.html", { root: "dist/Mister-Blog" });
});

app.listen(process.env.PORT || 8080);

console.log(`Running on port ${process.env.PORT || 8080}`);
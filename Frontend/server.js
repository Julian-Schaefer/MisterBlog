const express = require("express");

function requireHTTPS(req, res, next) {
    // The 'x-forwarded-proto' check is for Heroku
    if (req.header('x-forwarded-proto') !== 'https') {
        res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
        next();
    }
}

const app = express();

app.use(express.static("./dist/Mister-Blog"));
app.use(requireHTTPS);

app.get("/*", function (req, res) {
    res.sendFile("index.html", { root: "dist/Mister-Blog" });
});

app.listen(process.env.PORT || 8080);

console.log(`Running on port ${process.env.PORT || 8080}`);
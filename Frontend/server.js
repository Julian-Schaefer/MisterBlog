const express = require("express");

function requireHTTPS(req, res, next) {
    // The 'x-forwarded-proto' check is for Heroku
    if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
        return res.redirect('https://' + req.get('host') + req.url);
    }

    next();
}

const app = express();

app.use(express.static("./dist/Mister-Blog"));
app.use(requireHTTPS);

app.get("/*", function (req, res) {
    res.sendFile("index.html", { root: "dist/Mister-Blog" });
});

app.listen(process.env.PORT || 8080);

console.log(`Running on port ${process.env.PORT || 8080}`);
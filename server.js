'use strict';

const express = require('express');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';
const path = __dirname + '/views/';

// App
const app = express();
app.get('/', (req, res) => {
    res.sendFile(path + 'index.html');
});
app.use("/src", express.static('./src/'));
app.use("/node_modules", express.static('./node_modules/'));
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
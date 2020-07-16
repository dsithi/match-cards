// express setup
const express = require('express');
const http = require('http');

const app = express();
const port = 5500;

// serve static html files
app.use(express.static('public'));


app.listen(port, () => {
    console.log(`hello from ${port}!`);
})
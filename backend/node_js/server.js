const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const port = 3000;


app.use('/images', express.static(path.join(__dirname, 'www/littlelisagreenhouse/images')));

app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, '10.0.0.204', () => {
    console.log(`Server is running at localhost:${port}`);

});
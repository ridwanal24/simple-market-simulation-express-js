const express = require('express');
const app = express();
const routes = require('./routes');
const port = 3000;

// Middleware
app.use(express.json())

// App Routes 
app.use('/', routes);


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
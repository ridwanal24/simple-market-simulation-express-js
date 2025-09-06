const express = require('express');
const path = require('path');
const app = express();
const routes = require('./routes');
const cors = require('cors');
const port = 3000;

// Middleware
app.use(express.json())
app.use(cors())

// Static
app.use(express.static(path.join(__dirname, 'public')));

// App Routes 
app.use('/', routes);

// UI sementara
app.get('/ui', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
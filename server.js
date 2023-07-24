const express = require('express');

const app = express();

// Init Middleware
app.use(express.json());


const user = require('./routes/user')
// Define Routes
app.use('/api/users', user);

app.get('*', (req, res) => {
    res.send('user is running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
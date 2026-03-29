const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
    res.send('Server is running');
});

// Contact form route
app.post('/contact', (req, res) => {
    const { name, email, message } = req.body;

    // Validation
    if (!name || !email || !message) {
        return res.json({
            success: false,
            message: "All fields are required"
        });
    }

    // Print in terminal
    console.log("Contact:", name, email, message);

    // Response
    res.json({
        success: true,
        message: "Message received successfully"
    });
});

// Start server
app.listen(5000, () => {
    console.log("Server running on port 5000");
});
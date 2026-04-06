const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Contact form route
app.post('/contact', (req, res) => {
    const { name, email, phone, subject, message, newsletter } = req.body;

    console.log("New contact form submission:");
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Phone:", phone);
    console.log("Subject:", subject);
    console.log("Message:", message);
    console.log("Newsletter:", newsletter);

    res.json({ success: true, message: "Your message has been sent successfully!" });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
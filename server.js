const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const User = require('./models/User');

const app = express();

mongoose.connect('mongodb://localhost:27017/tokenApp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
    secret: 'secret-token-app',
    resave: false,
    saveUninitialized: false
}));

// Register
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    const hash = await bcrypt.hash(password, 10);

    let user = new User({
        username,
        password: hash,
        tokens: 10, // Free tokens on sign-up
        received: [],
        sent: []
    });

    await user.save();
    req.session.userId = user._id;
    res.json({ success: true });
});

// Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    let user = await User.findOne({ username });

    if (!user) return res.json({ success: false, message: "User not found" });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.json({ success: false, message: "Wrong password" });

    req.session.userId = user._id;
    res.json({ success: true });
});

// Get current user
app.get('/api/user', async (req, res) => {
    if (!req.session.userId) return res.json({ loggedIn: false });

    let user = await User.findById(req.session.userId);
    res.json({
        loggedIn: true,
        username: user.username,
        tokens: user.tokens,
        received: user.received,
        sent: user.sent
    });
});

// Send token
app.post('/api/send', async (req, res) => {
    const { toUser, message, tokens } = req.body;
    let sender = await User.findById(req.session.userId);
    if (!sender) return res.json({ success: false, message: "Not logged in" });

    if (sender.tokens < tokens) {
        return res.json({ success: false, message: "Not enough tokens" });
    }

    let recipient = await User.findOne({ username: toUser });
    if (!recipient) {
        return res.json({ success: false, message: "Recipient not found" });
    }

    sender.tokens -= tokens;
    sender.sent.push({ to: toUser, tokens, message });
    recipient.tokens += tokens;
    recipient.received.push({ from: sender.username, tokens, message });

    await sender.save();
    await recipient.save();

    res.json({ success: true });
});

// Earn tokens via game
app.post('/api/earn', async (req, res) => {
    let user = await User.findById(req.session.userId);
    if (!user) return res.json({ success: false });

    user.tokens += 5; // For simplicity
    await user.save();

    res.json({ success: true, tokens: user.tokens });
});

// Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

app.listen(3000, () => console.log('Server started on http://localhost:3000'));

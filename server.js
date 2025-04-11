const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database simulation
let users = [];
let newsPosts = [];
let listings = [];
let chatMessages = [];
const ADMIN_KEY = "welcometester";

// Authentication Endpoints
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  if (user.banned) return res.status(403).json({ error: 'Account banned' });
  if (user.disabled) return res.status(403).json({ error: 'Account disabled' });
  
  res.json({ user });
});

app.post('/api/signup', (req, res) => {
  const { username, password, avatar } = req.body;
  
  if (users.some(u => u.username === username)) {
    return res.status(400).json({ error: 'Username taken' });
  }
  
  const newUser = {
    username,
    password,
    avatar: avatar || 'https://i.imgur.com/6VBx3io.png',
    banned: false,
    disabled: false
  };
  
  users.push(newUser);
  res.json({ user: newUser });
});

app.post('/api/update-profile', (req, res) => {
  const { currentUsername, newUsername, currentPassword, newPassword, newAvatar } = req.body;
  const userIndex = users.findIndex(u => u.username === currentUsername);
  
  if (userIndex === -1) return res.status(404).json({ error: 'User not found' });
  if (users[userIndex].password !== currentPassword) {
    return res.status(401).json({ error: 'Current password incorrect' });
  }
  
  if (newUsername && newUsername !== currentUsername) {
    if (users.some(u => u.username === newUsername)) {
      return res.status(400).json({ error: 'Username taken' });
    }
    users[userIndex].username = newUsername;
  }
  
  if (newPassword) users[userIndex].password = newPassword;
  if (newAvatar) users[userIndex].avatar = newAvatar;
  
  res.json({ user: users[userIndex] });
});

// News Endpoints
app.get('/api/news', (req, res) => {
  res.json({ news: newsPosts });
});

app.post('/api/news', (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Title and content required' });
  
  const newPost = {
    id: Date.now().toString(),
    title,
    content,
    date: new Date().toISOString()
  };
  
  newsPosts.unshift(newPost);
  res.json({ post: newPost });
});

app.delete('/api/news/:id', (req, res) => {
  const { id } = req.params;
  newsPosts = newsPosts.filter(post => post.id !== id);
  res.json({ success: true });
});

// Marketplace Endpoints
app.get('/api/listings', (req, res) => {
  res.json({ listings });
});

app.post('/api/listings', (req, res) => {
  const { itemName, itemLocation, itemPrice, itemImage } = req.body;
  
  if (!itemName || !itemLocation || !itemPrice) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const newListing = {
    id: Date.now().toString(),
    itemName,
    itemLocation,
    itemPrice,
    itemImage,
    date: new Date().toISOString()
  };
  
  listings.unshift(newListing);
  res.json({ listing: newListing });
});

app.delete('/api/listings/:id', (req, res) => {
  const { id } = req.params;
  listings = listings.filter(listing => listing.id !== id);
  res.json({ success: true });
});

app.delete('/api/listings', (req, res) => {
  listings = [];
  res.json({ success: true });
});

// Chat Endpoints
app.get('/api/chat', (req, res) => {
  res.json({ messages: chatMessages });
});

app.post('/api/chat', (req, res) => {
  const { username, message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });
  
  const newMessage = {
    id: Date.now().toString(),
    username: username || 'Guest',
    message,
    date: new Date().toISOString()
  };
  
  chatMessages.push(newMessage);
  res.json({ message: newMessage });
});

app.delete('/api/chat/:id', (req, res) => {
  const { id } = req.params;
  chatMessages = chatMessages.filter(msg => msg.id !== id);
  res.json({ success: true });
});

// Admin Endpoints
app.post('/api/admin/verify', (req, res) => {
  res.json({ verified: req.body.key === ADMIN_KEY });
});

app.get('/api/admin/users', (req, res) => {
  res.json({ users });
});

app.post('/api/admin/ban', (req, res) => {
  const { username } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  user.banned = true;
  res.json({ user });
});

app.post('/api/admin/unban', (req, res) => {
  const { username } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  user.banned = false;
  res.json({ user });
});

app.post('/api/admin/disable', (req, res) => {
  const { username } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  user.disabled = true;
  res.json({ user });
});

app.post('/api/admin/enable', (req, res) => {
  const { username } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  user.disabled = false;
  res.json({ user });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

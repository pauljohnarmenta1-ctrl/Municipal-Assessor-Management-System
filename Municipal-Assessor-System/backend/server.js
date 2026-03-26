const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = "buenavista-assessor-2026-secret-key";

// In-memory DB (replace with PostgreSQL/Supabase later)
let db = {
    users: [{ id: 1, username: "assessorbuenavista", password: "$2a$10$...", fullName: "Admin Staff" }],
    propertyTransactions: [],
    recordsManagement: [],
    taxMappings: [],
    fillableForms: []
};

// Login
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    
    const user = db.users.find(u => u.username === username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '8h' });
    
    res.json({
        success: true,
        user: { id: user.id, username: user.username, fullName: user.fullName },
        token
    });
});

// CRUD Routes Example for Property Transactions
app.get('/api/transactions', (req, res) => {
    res.json(db.propertyTransactions);
});

app.post('/api/transactions', (req, res) => {
    const newTrans = { id: Date.now(), ...req.body, created_at: new Date().toISOString() };
    db.propertyTransactions.unshift(newTrans);
    res.status(201).json(newTrans);
});

app.put('/api/transactions/:id', (req, res) => {
    const index = db.propertyTransactions.findIndex(t => t.id == req.params.id);
    if (index === -1) return res.status(404).json({ error: "Not found" });
    
    db.propertyTransactions[index] = { ...db.propertyTransactions[index], ...req.body };
    res.json(db.propertyTransactions[index]);
});

app.delete('/api/transactions/:id', (req, res) => {
    db.propertyTransactions = db.propertyTransactions.filter(t => t.id != req.params.id);
    res.json({ success: true });
});

// Add similar routes for records, taxMappings, forms...

app.listen(3000, () => {
    console.log('✅ Buenavista Assessor Backend running on http://localhost:3000');
});
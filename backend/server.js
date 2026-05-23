// ==========================================
// 1. IMPORTING DEPENDENCIES (The Toolbelt)
// ==========================================

// This line looks for your .env file and loads the database passwords into memory
// so we don't have to type them directly into the code.
require('dotenv').config(); 

// Express is the actual web server framework. It handles the HTTP requests.
const express = require('express'); 

// CORS acts like a security guard. Without it, your React app wouldn't be 
// allowed to talk to this server because they run on different ports.
const cors = require('cors'); 

// This imports the PostgreSQL tool. 'Pool' manages multiple user connections efficiently.
const { Pool } = require('pg'); 

// bcrypt is used to securely hash passwords before storing them in the database.
const bcrypt = require('bcrypt');


// ==========================================
// 2. SERVER SETUP
// ==========================================

// Here we physically create the server application
const app = express();

// We tell the server to use CORS (allow React to connect)
app.use(cors()); 

// We tell the server to automatically convert incoming web data into JSON format
app.use(express.json()); 


// ==========================================
// 3. DATABASE CONNECTION (The Kitchen)
// ==========================================

// We create a "Pool". Think of this as a pipeline to your pgAdmin database.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});


// ==========================================
// 4. API ROUTES (The Menu)
// ==========================================

// Route 0: The Homepage
// If someone goes to http://localhost:5000/ with no extra path, show this friendly message
// instead of throwing a "Cannot GET /" error.
app.get('/', (req, res) => {
    res.json({ message: "Welcome to the ATLAS API! The server is running perfectly on port 5000." });
});


// Route 1: Get all Buildings
// URL: http://localhost:5000/api/buildings
app.get('/api/buildings', async (req, res) => {
    try {
        // Ask the database for every unique building name in the map_nodes table
        const result = await pool.query('SELECT DISTINCT building FROM public.map_nodes');
        
        // The database returns a complex object. We map over it to just extract the names 
        // and send them to the browser as a clean array like ["PRP", "SJT"]
        res.json(result.rows.map(row => row.building));
    } catch (err) {
        console.error("Database error:", err.message);
        res.status(500).json({ error: "Failed to fetch buildings" });
    }
});


// Route 2: Search for a Room
// URL Example: http://localhost:5000/api/search?q=Chemistry

// ==========================================
// STRICT BUILDING SEARCH ROUTE
// ==========================================
// ==========================================
// STRICT BUILDING SEARCH ROUTE (UNRESTRICTED)
// ==========================================
app.get('/api/search', async (req, res) => {
    const query = req.query.q || '';
    const building = req.query.b || '';

    try {
        // Match the query against the room name OR the exact ID
        let sql = `SELECT * FROM public.map_nodes WHERE (name ILIKE $1 OR id ILIKE $1)`;
        let params = [`%${query}%`];

        // Strictly lock to the selected building (using ILIKE to be perfectly case-insensitive)
        if (building) {
            sql += ` AND building ILIKE $2`;
            params.push(building);
        }

        // CRITICAL FIX: Removed the LIMIT. 
        // Changed ORDER BY to 'id ASC'. This ensures that when the user clicks the empty box, 
        // the rooms are neatly sorted by floor (e.g. PRP_101, PRP_102, PRP_201) instead of random alphabetical names.
        sql += ` ORDER BY id ASC`;

        const result = await pool.query(sql, params);
        res.json(result.rows);
    } catch (err) {
        console.error("Database Search Error:", err.message);
        res.status(500).json({ error: "Server error during search." });
    }
});


// Route 3: Get the Map Graph for Pathfinding
// URL Example: http://localhost:5000/api/graph/SJT
app.get('/api/graph/:building', async (req, res) => {
    try {
        // Extract the building name (like 'SJT') from the URL
        const { building } = req.params;

        // Query 1: Grab every single room/node that belongs to this specific building
        const nodes = await pool.query(
            'SELECT * FROM public.map_nodes WHERE building = $1', 
            [building.toUpperCase()]
        );

        // Query 2: Grab the connections (edges). We only want edges where the starting room
        // is inside the requested building.
        const edges = await pool.query(
            `SELECT e.* FROM public.map_edges e
             JOIN public.map_nodes n ON e.source_node = n.id
             WHERE n.building = $1`,
            [building.toUpperCase()]
        );

        // Package all the nodes and edges together into one massive JSON payload
        // This is what React will use to calculate the shortest paths!
        res.json({
            building: building.toUpperCase(),
            totalNodes: nodes.rowCount,
            totalEdges: edges.rowCount,
            nodes: nodes.rows,
            edges: edges.rows
        });
    } catch (err) {
        console.error("Graph fetch error:", err.message);
        res.status(500).json({ error: "Failed to fetch map graph" });
    }
});

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// 1. REGISTER A NEW USER
app.post('/api/auth/register', async (req, res) => {
    const { name, reg_no, password } = req.body;

    // Validate that all required fields are present
    if (!name || !reg_no || !password) {
        return res.status(400).json({ error: "All fields (name, reg_no, password) are required." });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    try {
        // Check if user already exists
        const userExists = await pool.query('SELECT * FROM public.users WHERE reg_no = $1', [reg_no.toUpperCase()]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: "Registration number already exists!" });
        }

        // Encrypt the password (salt rounds = 10)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save to database
        const newUser = await pool.query(
            'INSERT INTO public.users (name, reg_no, password) VALUES ($1, $2, $3) RETURNING id, name, reg_no',
            [name, reg_no.toUpperCase(), hashedPassword]
        );

        res.json({ message: "Registration successful!", user: newUser.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error during registration." });
    }
});

// 2. LOGIN AN EXISTING USER
app.post('/api/auth/login', async (req, res) => {
    const { reg_no, password } = req.body;

    // Validate that required fields are present
    if (!reg_no || !password) {
        return res.status(400).json({ error: "Registration number and password are required." });
    }

    try {
        // Find the user
        const result = await pool.query('SELECT * FROM public.users WHERE reg_no = $1', [reg_no.toUpperCase()]);
        if (result.rows.length === 0) {
            return res.status(400).json({ error: "User not found. Please register." });
        }

        const user = result.rows[0];

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: "Incorrect password." });
        }

        // Success! Send back user data (WITHOUT the password)
        res.json({ 
            message: "Login successful!", 
            user: { id: user.id, name: user.name, reg_no: user.reg_no } 
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error during login." });
    }
});

// ==========================================
// 5. STARTING THE SERVER
// ==========================================

// We HARDCODE Port 5000 here so it never accidentally steals the Postgres port (5432)
const PORT = process.env.PORT || 5000; 

// Tell the server to turn on, listen at Port 5000, and print a message when ready
app.listen(PORT, () => {
    console.log(`🚀 ATLAS API Server running on http://localhost:${PORT}`);
    console.log(`Try clicking here: http://localhost:${PORT}/api/buildings`);
});
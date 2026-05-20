require('dotenv').config();
const { Pool } = require('pg');

// We are intentionally connecting to the default "postgres" database
// because we know 100% that it always exists.
const pool = new Pool({
    user: process.env.DB_USER,         
    host: process.env.DB_HOST,         
    database: 'postgres',              // <-- The master database
    password: process.env.DB_PASSWORD, 
    port: process.env.DB_PORT,         
});

console.log("🕵️  Asking PostgreSQL for a list of all databases on Port 5432...");

pool.query('SELECT datname FROM pg_database WHERE datistemplate = false;')
    .then(res => {
        console.log("\n✅ Success! Here are the exact database names Postgres sees:");
        res.rows.forEach(row => console.log(`   👉 "${row.datname}"`));
        console.log("\nLook closely at the names above. Is ATLAS in there?");
        process.exit();
    })
    .catch(err => {
        console.error("\n❌ CRITICAL ERROR connecting to Postgres:");
        console.error(err.message);
        process.exit();
    });
import pg from "pg";
const { Pool } = pg;
// Create a connection pool only if DATABASE_URL is provided
const pool = process.env.DATABASE_URL
    ? new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === "production"
            ? { rejectUnauthorized: false }
            : false,
    })
    : null;
// Initialize the database table
export async function initializeDatabase() {
    if (!pool) {
        console.log("⚠️  No DATABASE_URL provided - skipping database initialization");
        console.log("   Search history will not persist. Set DATABASE_URL to enable database.");
        return;
    }
    const client = await pool.connect();
    try {
        // Create search_history table if it doesn't exist
        await client.query(`
      CREATE TABLE IF NOT EXISTS search_history (
        id UUID PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        city_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(session_id, city_name)
      );
    `);
        // Create index on session_id for faster queries
        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_search_history_session_id 
      ON search_history(session_id);
    `);
        console.log("✅ Database initialized successfully");
    }
    catch (error) {
        console.error("❌ Error initializing database:", error);
        throw error;
    }
    finally {
        client.release();
    }
}
export default pool;

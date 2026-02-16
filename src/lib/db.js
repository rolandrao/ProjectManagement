import { neon } from '@neondatabase/serverless';

// Simple, direct connection using your connection string
// Note: We use import.meta.env.VITE_DATABASE_URL to be safe with Vite
const sql = neon(import.meta.env.VITE_DATABASE_URL);

export default sql;
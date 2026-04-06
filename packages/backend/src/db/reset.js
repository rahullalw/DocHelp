import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function resetDatabase() {
  try {
    console.log('Dropping all tables and types...');
    
    // Drop tables first (due to foreign key constraints)
    await sql`DROP TABLE IF EXISTS messages CASCADE`;
    await sql`DROP TABLE IF EXISTS projects CASCADE`;
    await sql`DROP TABLE IF EXISTS guest_sessions CASCADE`;
    await sql`DROP TABLE IF EXISTS users CASCADE`;
    
    // Drop enums
    await sql`DROP TYPE IF EXISTS message_role CASCADE`;
    await sql`DROP TYPE IF EXISTS user_type CASCADE`;
    
    console.log('✅ Database reset complete! You can now run migrations.');
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

resetDatabase();







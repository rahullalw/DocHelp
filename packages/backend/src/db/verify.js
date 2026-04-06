import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

async function verifyDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  console.log('Connecting to database...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@')); // Hide password
  
  const sql = neon(process.env.DATABASE_URL);

  try {
    // Check if tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    console.log('\n✓ Connected successfully!');
    console.log('\nTables in public schema:');
    if (tables.length === 0) {
      console.log('  (no tables found)');
    } else {
      tables.forEach(t => console.log(`  - ${t.table_name}`));
    }

    // Check enums
    const enums = await sql`
      SELECT typname 
      FROM pg_type 
      WHERE typtype = 'e' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      ORDER BY typname;
    `;

    console.log('\nEnums in public schema:');
    if (enums.length === 0) {
      console.log('  (no enums found)');
    } else {
      enums.forEach(e => console.log(`  - ${e.typname}`));
    }

    // Try to count users
    try {
      const userCount = await sql`SELECT COUNT(*) as count FROM users;`;
      console.log(`\n✓ Users table accessible: ${userCount[0].count} users`);
    } catch (error) {
      console.log('\n✗ Users table not accessible:', error.message);
    }

  } catch (error) {
    console.error('✗ Database verification failed:', error);
    throw error;
  }
}

verifyDatabase().catch((error) => {
  console.error('Verification failed:', error);
  process.exit(1);
});

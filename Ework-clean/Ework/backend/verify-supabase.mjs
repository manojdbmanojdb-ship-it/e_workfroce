// Utility script to verify live Supabase connection and tables
import dotenv from 'dotenv';
dotenv.config();

const projectRef = process.env.SUPABASE_PROJECT_REF || 'agggzpdbqvjiulqtzyrn';
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable__8-Vwbf0J08_JQ3cu6ekUw_qX9p5LlW';

async function verify() {
  console.log(`Connecting to Supabase project: ${projectRef}...`);
  const tables = [
    'users',
    'organizations',
    'tasks',
    'attendance',
    'employee_sign_ins',
    'work_sites',
    'subscriptions',
    'licenses',
    'shifts',
    'assets',
    'expenses',
    'chat_messages',
    'sos_alerts',
    'payments'
  ];

  for (const table of tables) {
    try {
      const res = await fetch(`https://${projectRef}.supabase.co/rest/v1/${table}?select=*&limit=1`, {
        headers: {
          'apikey': publishableKey,
          'Authorization': `Bearer ${publishableKey}`
        }
      });
      const data = await res.json();
      const statusIcon = res.status === 200 ? '✅' : '❌';
      console.log(`${statusIcon} Table [${table.padEnd(20)}]: Status ${res.status} | Rows: ${Array.isArray(data) ? data.length : JSON.stringify(data)}`);
    } catch (err) {
      console.log(`❌ Table [${table.padEnd(20)}]: Error ${err.message}`);
    }
  }
}

verify();

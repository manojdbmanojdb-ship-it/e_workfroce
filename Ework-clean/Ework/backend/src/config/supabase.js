import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://agggzpdbqvjiulqtzyrn.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable__8-Vwbf0J08_JQ3cu6ekUw_qX9p5LlW';

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;

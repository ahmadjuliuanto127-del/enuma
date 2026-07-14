require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkProfiles() {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) {
    console.error('Error fetching profiles:', error.message);
  } else {
    console.log('Profiles table contains', data.length, 'rows:', data);
  }

  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.log('Could not list auth users with anon key (expected)');
  }
}

checkProfiles();

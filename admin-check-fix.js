// Open your browser console and run this script to diagnose auth issues

// 1. Check what's stored in localStorage
console.log('------ LOCAL STORAGE ITEMS ------');
for(let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(`${key}: ${localStorage.getItem(key)}`);
}

// 2. Check what's stored in sessionStorage
console.log('\n------ SESSION STORAGE ITEMS ------');
for(let i = 0; i < sessionStorage.length; i++) {
  const key = sessionStorage.key(i);
  console.log(`${key}: ${sessionStorage.getItem(key)}`);
}

// 3. Check cookies
console.log('\n------ COOKIES ------');
console.log(document.cookie);

// 4. Check if Supabase auth token exists
console.log('\n------ SUPABASE AUTH STATUS ------');
const supabaseTokenKey = Object.keys(localStorage).find(key => key.includes('supabase.auth.token'));
console.log(`Auth token exists: ${supabaseTokenKey ? 'YES' : 'NO'}`);

if (supabaseTokenKey) {
  try {
    const token = JSON.parse(localStorage.getItem(supabaseTokenKey));
    console.log('Auth expiry:', new Date(token.expires_at * 1000).toLocaleString());
    console.log('User ID:', token.user?.id);
    console.log('User email:', token.user?.email);
  } catch (e) {
    console.log('Error parsing token:', e);
  }
} 
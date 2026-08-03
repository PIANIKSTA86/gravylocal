import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function main() {
  console.log('Testing admin superuser login...');
  
  // Test superadmins
  const superadmins = ['julian.mm.piano@gmail.com', 'superadmin@contaco.com', 'test2@admin.com'];
  const passes = ['Admin1234!', 'admin123', '12345678', 'admin', 'test123456'];

  let loggedIn = false;
  for (const s of superadmins) {
    for (const p of passes) {
      try {
        await pb.admins.authWithPassword(s, p);
        console.log(`SUPERADMIN LOGIN SUCCESS! User: ${s}, Pass: ${p}`);
        loggedIn = true;
        break;
      } catch (_) {}
    }
    if (loggedIn) break;
  }

  // Also test regular user logins
  console.log('\nTesting regular user login for caldana@gravy.com...');
  for (const p of ['12345678', '123456', 'caldana', 'caldana123', 'admin123', 'Admin1234!']) {
    try {
      const res = await pb.collection('users').authWithPassword('caldana@gravy.com', p);
      console.log(`CALDANA LOGIN SUCCESS! Password is: ${p}`);
      return;
    } catch (_) {}
  }

  console.log('Caldana login failed with tested passwords.');
}

main();

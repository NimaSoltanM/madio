import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function checkUser() {
  try {
    // Get user by ID
    const user = await pb.collection('users').getOne('yej90tktrjo8ya0');

    console.log('\n=== USER DATA ===');
    console.log('ID:', user.id);
    console.log('Email:', user.email);
    console.log('Name:', user.name);
    console.log('Role:', user.role);
    console.log('isSuperuser:', user.isSuperuser);
    console.log('\nFull user object:');
    console.log(JSON.stringify(user, null, 2));

    console.log('\n=== AUTH STORE INFO ===');
    console.log('After logging in with this user:');
    console.log('pb.authStore.isAdmin would be:', false, '(only true for admin accounts)');
    console.log('pb.authStore.model?.isSuperuser would be:', user.isSuperuser);

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Make sure PocketBase is running on http://127.0.0.1:8090');
  }
}

checkUser();

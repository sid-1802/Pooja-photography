const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const CONFIG_FILE = path.join(__dirname, 'data', 'config.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setup() {
  console.log('\n=== Photography Portfolio Setup ===\n');
  
  // Check if config already exists
  let existingConfig = {};
  try {
    existingConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  } catch (err) {
    // Config doesn't exist yet
  }
  
  if (existingConfig.adminPassword) {
    const overwrite = await question('Admin credentials already configured. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      rl.close();
      return;
    }
  }
  
  // Get username
  const username = await question('Enter admin username: ');
  
  if (!username || username.length < 3) {
    console.log('Error: Username must be at least 3 characters.');
    rl.close();
    return;
  }
  
  // Get password
  const password = await question('Enter admin password: ');
  
  if (!password || password.length < 4) {
    console.log('Error: Password must be at least 4 characters.');
    rl.close();
    return;
  }
  
  const confirmPassword = await question('Confirm admin password: ');
  
  if (password !== confirmPassword) {
    console.log('Error: Passwords do not match.');
    rl.close();
    return;
  }
  
  // Get site name
  const siteName = await question('Site name (default: Photography Portfolio): ');
  
  // Hash password and generate session secret
  const hashedPassword = await bcrypt.hash(password, 10);
  const sessionSecret = crypto.randomBytes(32).toString('hex');
  
  const config = {
    adminUsername: username,
    adminPassword: hashedPassword,
    sessionSecret: sessionSecret,
    siteName: siteName || 'Photography Portfolio'
  };
  
  // Ensure data directory exists
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Write config
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  
  console.log('\nSetup complete!');
  console.log('Run "npm start" to start the server.');
  console.log('Then visit http://localhost:3000/admin.html to access the admin panel.\n');
  
  rl.close();
}

setup().catch(err => {
  console.error('Setup failed:', err);
  rl.close();
  process.exit(1);
});

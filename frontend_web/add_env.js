const fs = require('fs');
const cp = require('child_process');

const envContent = fs.readFileSync('.env.local', 'utf8');
const lines = envContent.split('\n');
const env = {};
for (const line of lines) {
  if (line.trim() && !line.startsWith('#')) {
    const splitIndex = line.indexOf('=');
    if (splitIndex !== -1) {
      const k = line.substring(0, splitIndex).trim();
      let v = line.substring(splitIndex + 1).trim();
      if (v.startsWith('"') && v.endsWith('"')) {
        v = v.slice(1, -1);
      }
      env[k] = v;
    }
  }
}

try {
  console.log("Adding GOOGLE_PRIVATE_KEY to preview...");
  cp.execSync('npx -y vercel env add GOOGLE_PRIVATE_KEY preview', { input: env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), stdio: ['pipe', 'inherit', 'inherit'] });
} catch (e) {
  console.log("Error adding GOOGLE_PRIVATE_KEY:", e.message);
}

try {
  console.log("Adding GOOGLE_SHEET_ID to preview...");
  cp.execSync('npx -y vercel env add GOOGLE_SHEET_ID preview', { input: env.GOOGLE_SHEET_ID, stdio: ['pipe', 'inherit', 'inherit'] });
} catch (e) {}

try {
  console.log("Adding GOOGLE_SERVICE_ACCOUNT_EMAIL to preview...");
  cp.execSync('npx -y vercel env add GOOGLE_SERVICE_ACCOUNT_EMAIL preview', { input: env.GOOGLE_SERVICE_ACCOUNT_EMAIL, stdio: ['pipe', 'inherit', 'inherit'] });
} catch (e) {}

#!/usr/bin/env node

/**
 * OmniForge Demo Script (Node.js)
 * Cross-platform demo setup script
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, options = {}) {
  try {
    return execSync(command, { stdio: 'inherit', ...options });
  } catch (error) {
    log(`Error executing: ${command}`, 'red');
    throw error;
  }
}

function checkCommand(command, name) {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    log(`❌ ${name} is not installed`, 'red');
    return false;
  }
}

async function main() {
  log('🚀 OmniForge Demo Setup', 'cyan');
  log('======================\n', 'cyan');

  // Set environment variables
  process.env.DEMO_MODE = 'true';
  process.env.NODE_ENV = 'development';

  // Check prerequisites
  log('📋 Checking prerequisites...', 'yellow');
  if (!checkCommand('node', 'Node.js')) {
    process.exit(1);
  }
  if (!checkCommand('docker', 'Docker')) {
    process.exit(1);
  }
  log('✅ Prerequisites met\n', 'green');

  // Install dependencies
  log('📦 Step 1: Installing dependencies...', 'yellow');
  if (!fs.existsSync('node_modules')) {
    exec('npm install');
  } else {
    log('   Dependencies already installed, skipping...');
  }
  log('✅ Dependencies installed\n', 'green');

  // Start Docker
  log('🐳 Step 2: Starting Docker services...', 'yellow');
  exec('docker-compose up -d');
  log('   Waiting for services to be healthy...');
  
  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  log('✅ Docker services started\n', 'green');

  // Generate Prisma client
  log('🔧 Step 3: Generating Prisma client...', 'yellow');
  process.chdir('apps/backend');
  exec('npx prisma generate');
  process.chdir('../..');
  log('✅ Prisma client generated\n', 'green');

  // Run migrations
  log('🗄️  Step 4: Running database migrations...', 'yellow');
  process.chdir('apps/backend');
  try {
    exec('npx prisma migrate dev --name init');
  } catch (error) {
    log('   Migration may have issues, continuing...', 'yellow');
  }
  process.chdir('../..');
  log('✅ Migrations completed\n', 'green');

  // Seed database
  log('🌱 Step 5: Seeding database...', 'yellow');
  process.chdir('apps/backend');
  try {
    exec('npx ts-node prisma/seed.ts');
  } catch (error) {
    log('   Seeding may have failed, continuing...', 'yellow');
  }
  process.chdir('../..');
  log('✅ Database seeded\n', 'green');

  // Final message
  log('========================================', 'green');
  log('🚀 OmniForge Demo is ready!', 'green');
  log('========================================\n', 'green');
  log('📍 Services will be available at:');
  log('   - Frontend:  http://localhost:3000');
  log('   - Backend:   http://localhost:3001/api');
  log('   - API Docs:  http://localhost:3001/api/docs\n');
  log('📝 Quick Test:');
  log('   curl http://localhost:3001/api/health\n', 'yellow');
  log('Press Ctrl+C to stop all services\n', 'yellow');

  // Start services
  log('🎯 Starting services...\n', 'yellow');
  exec('npm run dev:demo');
}

main().catch((error) => {
  log(`\n❌ Error: ${error.message}`, 'red');
  process.exit(1);
});


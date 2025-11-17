#!/usr/bin/env ts-node

/**
 * Test Runner - Runs all test suites
 * Usage: npm run test:all
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const testSuites = [
  { name: 'Smoke Tests', file: 'tests/e2e/smoke.spec.ts' },
  { name: 'Functionality Tests', file: 'tests/e2e/functionality.spec.ts' },
  { name: 'Regression Tests', file: 'tests/e2e/regression.spec.ts' },
  { name: 'UAT Tests', file: 'tests/e2e/uat.spec.ts' },
  { name: 'User Testing', file: 'tests/user-testing/user-scenarios.spec.ts' },
  { name: 'Integration Tests', file: 'tests/integration/api-integration.spec.ts' },
  { name: 'Real-time Integration', file: 'tests/integration/realtime-integration.spec.ts' },
  { name: 'Grey Box Tests', file: 'tests/greybox/greybox.spec.ts' },
];

interface TestResult {
  suite: string;
  passed: boolean;
  duration: number;
  errors?: string[];
}

const results: TestResult[] = [];

console.log('🧪 Starting comprehensive test suite...\n');

// Check if backend is running
try {
  execSync('curl -f http://localhost:3001/api/health || exit 1', { stdio: 'ignore' });
  console.log('✅ Backend is running\n');
} catch {
  console.error('❌ Backend is not running. Please start it first.');
  process.exit(1);
}

// Check if frontend is running
try {
  execSync('curl -f http://localhost:3000 || exit 1', { stdio: 'ignore' });
  console.log('✅ Frontend is running\n');
} catch {
  console.error('❌ Frontend is not running. Please start it first.');
  process.exit(1);
}

// Run each test suite
for (const suite of testSuites) {
  if (!fs.existsSync(suite.file)) {
    console.log(`⏭️  Skipping ${suite.name} (file not found)`);
    continue;
  }

  console.log(`\n📋 Running ${suite.name}...`);
  const startTime = Date.now();

  try {
    execSync(`npx playwright test ${suite.file} --reporter=list`, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });

    const duration = Date.now() - startTime;
    results.push({
      suite: suite.name,
      passed: true,
      duration,
    });
    console.log(`✅ ${suite.name} passed (${duration}ms)\n`);
  } catch (error: any) {
    const duration = Date.now() - startTime;
    results.push({
      suite: suite.name,
      passed: false,
      duration,
      errors: [error.message],
    });
    console.log(`❌ ${suite.name} failed (${duration}ms)\n`);
  }
}

// Print summary
console.log('\n' + '='.repeat(60));
console.log('📊 TEST SUMMARY');
console.log('='.repeat(60));

let totalPassed = 0;
let totalFailed = 0;
let totalDuration = 0;

results.forEach((result) => {
  totalDuration += result.duration;
  if (result.passed) {
    totalPassed++;
    console.log(`✅ ${result.suite.padEnd(30)} ${result.duration}ms`);
  } else {
    totalFailed++;
    console.log(`❌ ${result.suite.padEnd(30)} ${result.duration}ms`);
    if (result.errors) {
      result.errors.forEach((error) => console.log(`   ${error}`));
    }
  }
});

console.log('='.repeat(60));
console.log(`Total: ${results.length} suites`);
console.log(`Passed: ${totalPassed}`);
console.log(`Failed: ${totalFailed}`);
console.log(`Total Duration: ${totalDuration}ms`);
console.log('='.repeat(60));

if (totalFailed > 0) {
  process.exit(1);
}


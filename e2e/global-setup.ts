import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

async function globalSetup(config: FullConfig) {
  // Load test environment variables
  dotenv.config({ path: path.join(__dirname, '.env.test') });

  // Ensure auth directory exists
  const authDir = path.join(__dirname, '.auth');
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // Ensure test-results directory exists
  const testResultsDir = path.join(process.cwd(), 'test-results');
  if (!fs.existsSync(testResultsDir)) {
    fs.mkdirSync(testResultsDir, { recursive: true });
  }
}

export default globalSetup; 
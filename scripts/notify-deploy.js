#!/usr/bin/env node
/**
 * Send a Discord notification about a code deployment
 *
 * Usage:
 *   node scripts/notify-deploy.js                    # Auto-detect from latest commit
 *   node scripts/notify-deploy.js "Custom changelog" # Override changelog message
 *
 * This script reads git commit information and sends a notification
 * to Discord with the version number and changelog.
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { notifyCodeUpdate } from './discord-notifier.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getGitInfo() {
  try {
    // Get latest commit hash (short)
    const hash = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();

    // Get commit message (first line)
    const message = execSync('git log -1 --pretty=%s', { encoding: 'utf-8' }).trim();

    // Get commit body (additional lines, if any)
    const body = execSync('git log -1 --pretty=%b', { encoding: 'utf-8' }).trim();

    return { hash, message, body };
  } catch (error) {
    console.error('Error reading git info:', error.message);
    return { hash: 'unknown', message: 'Unknown commit', body: '' };
  }
}

function getVersionFromFile() {
  try {
    const versionPath = join(__dirname, '..', 'public', 'version.json');
    const versionData = JSON.parse(readFileSync(versionPath, 'utf-8'));
    return versionData.version || versionData.date || 'unknown';
  } catch (error) {
    // Fall back to git-based version
    try {
      const date = new Date().toISOString().split('T')[0];
      const hash = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
      return `${date}-${hash}`;
    } catch {
      return 'unknown';
    }
  }
}

function formatChangelog(message, body, customChangelog) {
  // If custom changelog provided via command line, use it
  if (customChangelog) {
    return customChangelog;
  }

  // Parse commit message for bullet points
  let changelog = '';

  // If the body has content, use it
  if (body) {
    // Filter out Co-Authored-By lines and empty lines at the end
    const lines = body
      .split('\n')
      .filter(line => !line.startsWith('Co-Authored-By:'))
      .filter(line => line.trim())
      .map(line => line.startsWith('-') ? line : `• ${line}`)
      .join('\n');

    if (lines) {
      changelog = lines;
    }
  }

  // If no body, try to create from message
  if (!changelog && message) {
    // If message contains a dash list, extract it
    if (message.includes(' - ')) {
      const parts = message.split(' - ');
      changelog = parts.slice(1).map(p => `• ${p.trim()}`).join('\n');
    }
  }

  return changelog || null;
}

async function main() {
  console.log('📤 Sending code update notification to Discord...\n');

  // Get custom changelog from command line args
  const customChangelog = process.argv[2] || null;

  // Get git info
  const { hash, message, body } = getGitInfo();
  console.log(`  Commit: ${hash}`);
  console.log(`  Message: ${message}`);

  // Get version
  const version = getVersionFromFile();
  console.log(`  Version: ${version}`);

  // Format changelog
  const changelog = formatChangelog(message, body, customChangelog);
  if (changelog) {
    console.log(`  Changelog:\n${changelog.split('\n').map(l => `    ${l}`).join('\n')}`);
  }

  // Send notification
  try {
    await notifyCodeUpdate(version, {
      hash,
      message,
      changelog
    });
    console.log('\n✅ Discord notification sent successfully!');
  } catch (error) {
    console.error('\n❌ Failed to send notification:', error.message);
    process.exit(1);
  }
}

main();

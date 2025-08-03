// scripts/version.js
import { execSync } from 'child_process'
import fs from 'fs'

try {
  // Get git commit hash and timestamp
  const gitHash = execSync('git rev-parse --short HEAD').toString().trim()
  const gitDate = execSync('git log -1 --format=%cd --date=short').toString().trim()
  const buildTime = new Date().toISOString()
  
  const versionInfo = {
    hash: gitHash,
    date: gitDate,
    buildTime,
    version: `${gitDate}-${gitHash}`
  }
  
  // Write to public folder so it's accessible
  fs.writeFileSync('public/version.json', JSON.stringify(versionInfo, null, 2))
  
  console.log('✅ Version info generated:', versionInfo.version)
} catch (error) {
  console.log('⚠️  Could not generate version info:', error.message)
  
  // Fallback version
  const fallbackVersion = {
    hash: 'dev',
    date: new Date().toISOString().split('T')[0],
    buildTime: new Date().toISOString(),
    version: 'dev-build'
  }
  
  fs.writeFileSync('public/version.json', JSON.stringify(fallbackVersion, null, 2))
}

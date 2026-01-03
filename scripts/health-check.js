/**
 * Premonition System Health Check
 *
 * Single source of truth for system status.
 * Validates data integrity, consistency, and functionality.
 * Reports to Discord.
 *
 * NEVER modifies any data - purely diagnostic.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getCurrentStandings, getApiCallCount } from './api-client.js';
import { notifySuccess, notifyError } from './discord-notifier.js';
import { calculateCompetitionScoresForWeek } from '../src/data/competitionData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STANDINGS_PATH = path.join(__dirname, '../src/data/standingsByGameweek.json');
const SCORES_PATH = path.join(__dirname, '../src/data/scoresByGameweek.json');
const HEALTH_STATE_PATH = path.join(__dirname, '../.health-check-state.json');

const checks = [];
let overallStatus = 'HEALTHY';

function addCheck(category, name, passed, message, severity = 'error') {
  checks.push({ category, name, passed, message, severity });
  if (!passed && severity === 'error') {
    overallStatus = 'UNHEALTHY';
  } else if (!passed && severity === 'warning' && overallStatus === 'HEALTHY') {
    overallStatus = 'WARNING';
  }
}

async function runHealthCheck() {
  console.log('='.repeat(60));
  console.log('PREMONITION SYSTEM HEALTH CHECK');
  console.log('='.repeat(60));
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
  console.log();

  // ============================================================
  // 1. ENVIRONMENT CHECKS
  // ============================================================
  console.log('[1/7] Checking environment configuration...');
  const requiredEnvVars = [
    'FOOTBALL_API_KEY',
    'DISCORD_WEBHOOK_URL',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];

  requiredEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    addCheck('Environment', envVar, !!value, value ? 'Configured' : 'Missing');
  });

  // ============================================================
  // 2. DATA FILE INTEGRITY
  // ============================================================
  console.log('[2/7] Checking data file integrity...');

  let standingsData = null;
  let scoresData = null;

  try {
    standingsData = JSON.parse(fs.readFileSync(STANDINGS_PATH, 'utf8'));
    addCheck('Data Files', 'standingsByGameweek.json', true, 'Valid JSON');
  } catch (error) {
    addCheck('Data Files', 'standingsByGameweek.json', false, `Invalid or missing: ${error.message}`);
  }

  try {
    scoresData = JSON.parse(fs.readFileSync(SCORES_PATH, 'utf8'));
    addCheck('Data Files', 'scoresByGameweek.json', true, 'Valid JSON');
  } catch (error) {
    addCheck('Data Files', 'scoresByGameweek.json', false, `Invalid or missing: ${error.message}`);
  }

  // ============================================================
  // 3. DATA CONSISTENCY & ACCURACY
  // ============================================================
  console.log('[3/7] Checking data consistency & accuracy...');

  if (standingsData && scoresData) {
    // Check gameweek continuity in standings
    const standingsWeeks = Object.keys(standingsData)
      .filter(k => /^\d+$/.test(k))
      .map(Number)
      .sort((a, b) => a - b);

    let hasGaps = false;
    for (let i = 1; i <= standingsWeeks[standingsWeeks.length - 1]; i++) {
      if (!standingsWeeks.includes(i)) {
        addCheck('Data Consistency', 'Gameweek continuity', false, `Gap detected: GW${i} missing`);
        hasGaps = true;
        break;
      }
    }
    if (!hasGaps) {
      addCheck('Data Consistency', 'Gameweek continuity', true, `GW1-${standingsWeeks[standingsWeeks.length - 1]} complete`);
    }

    // Check all gameweeks have 20 teams
    let allHave20Teams = true;
    standingsWeeks.forEach(gw => {
      const teams = Object.keys(standingsData[gw]).filter(k => /^\d+$/.test(k));
      if (teams.length !== 20) {
        addCheck('Data Consistency', `GW${gw} team count`, false, `Has ${teams.length} teams, expected 20`);
        allHave20Teams = false;
      }
    });
    if (allHave20Teams) {
      addCheck('Data Consistency', 'Team count', true, 'All gameweeks have 20 teams');
    }

    // Check scores match standings
    const scoresWeeks = Object.keys(scoresData)
      .filter(k => /^\d+$/.test(k))
      .map(Number)
      .sort((a, b) => a - b);

    const standingsSet = new Set(standingsWeeks);
    const scoresSet = new Set(scoresWeeks);
    const missingScores = standingsWeeks.filter(gw => !scoresSet.has(gw));
    const extraScores = scoresWeeks.filter(gw => !standingsSet.has(gw));

    if (missingScores.length > 0) {
      addCheck('Data Consistency', 'Scores completeness', false, `Missing scores for GW: ${missingScores.join(', ')}`);
    } else if (extraScores.length > 0) {
      addCheck('Data Consistency', 'Scores completeness', false, `Extra scores for GW: ${extraScores.join(', ')}`, 'warning');
    } else {
      addCheck('Data Consistency', 'Scores completeness', true, 'Scores match standings');
    }

    // Check week-over-week comparison data availability
    const latestGW = standingsWeeks[standingsWeeks.length - 1];
    if (latestGW > 1) {
      const prevGW = latestGW - 1;
      const hasCurrentScores = scoresData[latestGW] && Array.isArray(scoresData[latestGW]);
      const hasPrevScores = scoresData[prevGW] && Array.isArray(scoresData[prevGW]);

      if (hasCurrentScores && hasPrevScores) {
        // Verify scores have the required structure
        const sampleCurrent = scoresData[latestGW][0];
        const samplePrev = scoresData[prevGW][0];
        const hasRequiredFields = sampleCurrent?.name && sampleCurrent?.totalScore &&
                                   samplePrev?.name && samplePrev?.totalScore;

        addCheck('Functionality', 'Week-over-week comparison', hasRequiredFields,
                hasRequiredFields ? `GW${prevGW}→${latestGW} data available` : 'Score structure invalid');
      } else {
        addCheck('Functionality', 'Week-over-week comparison', false,
                `Missing scores: GW${latestGW}=${hasCurrentScores}, GW${prevGW}=${hasPrevScores}`);
      }
    }

    // ============================================================
    // SCORE ACCURACY VERIFICATION (Spot Check)
    // ============================================================
    // Independently recalculate scores for the latest gameweek to verify
    // that scoresByGameweek.json contains accurate data
    if (scoresData[latestGW] && Array.isArray(scoresData[latestGW])) {
      try {
        // Calculate fresh scores using the same function that automation uses
        const freshScores = calculateCompetitionScoresForWeek(latestGW, 'all');
        const savedScores = scoresData[latestGW];

        // Build lookup maps
        const freshMap = Object.fromEntries(
          freshScores.map(s => [s.name, s.totalScore])
        );
        const savedMap = Object.fromEntries(
          savedScores.map(s => [s.name, s.totalScore])
        );

        // Compare scores for each player
        let allMatch = true;
        let mismatchDetails = [];

        for (const player of freshScores) {
          const savedScore = savedMap[player.name];
          if (savedScore !== player.totalScore) {
            allMatch = false;
            mismatchDetails.push(`${player.name}: saved=${savedScore}, calculated=${player.totalScore}`);
          }
        }

        if (allMatch && freshScores.length === savedScores.length) {
          addCheck('Data Accuracy', 'Score verification (GW' + latestGW + ')', true,
                  `All ${freshScores.length} player scores match independent calculation`);
        } else if (!allMatch) {
          addCheck('Data Accuracy', 'Score verification (GW' + latestGW + ')', false,
                  `Mismatches found: ${mismatchDetails.slice(0, 3).join('; ')}${mismatchDetails.length > 3 ? '...' : ''}`);
        } else {
          addCheck('Data Accuracy', 'Score verification (GW' + latestGW + ')', false,
                  `Player count mismatch: saved=${savedScores.length}, calculated=${freshScores.length}`);
        }
      } catch (error) {
        addCheck('Data Accuracy', 'Score verification (GW' + latestGW + ')', false,
                `Verification failed: ${error.message}`, 'warning');
      }
    }
  }

  // ============================================================
  // 4. API STATE CHECK (Efficient - only call if needed)
  // ============================================================
  console.log('[4/7] Checking API state...');

  let shouldCallAPI = true;
  let lastCheckState = null;

  // Read last check state to avoid unnecessary API calls
  if (fs.existsSync(HEALTH_STATE_PATH)) {
    try {
      lastCheckState = JSON.parse(fs.readFileSync(HEALTH_STATE_PATH, 'utf8'));
      const hoursSinceLastCheck = (Date.now() - new Date(lastCheckState.timestamp)) / (1000 * 60 * 60);

      // Only call API if more than 1 hour since last check
      if (hoursSinceLastCheck < 1) {
        shouldCallAPI = false;
        addCheck('API', 'Connection', true, `Using cached state (${Math.round(hoursSinceLastCheck * 60)}min ago)`, 'warning');
        addCheck('API', 'Current state', true, `Last known: GW${lastCheckState.currentMatchday}, saved: GW${lastCheckState.savedMatchweek}`);
      }
    } catch (error) {
      // Ignore - will do fresh check
    }
  }

  if (shouldCallAPI) {
    try {
      const { season, standings } = await getCurrentStandings();
      const gamesPlayed = standings.map(t => t.playedGames);
      const minGames = Math.min(...gamesPlayed);
      const maxGames = Math.max(...gamesPlayed);
      const allSameGames = minGames === maxGames;

      addCheck('API', 'Connection', true, `Connected (${getApiCallCount()} calls used)`);
      addCheck('API', 'Current state', true,
              `Matchday ${season.currentMatchday}, all teams at ${minGames} games${allSameGames ? ' ✓' : ` (${maxGames} max)`}`);

      // Compare with saved data
      if (standingsData) {
        const savedWeeks = Object.keys(standingsData).filter(k => /^\d+$/.test(k)).map(Number);
        const latestSaved = Math.max(...savedWeeks);
        const behindBy = minGames - latestSaved;

        if (behindBy > 0) {
          addCheck('API', 'Data freshness', false, `${behindBy} gameweek(s) behind`, 'warning');
        } else {
          addCheck('API', 'Data freshness', true, 'Up to date');
        }

        // Save state for next check
        fs.writeFileSync(HEALTH_STATE_PATH, JSON.stringify({
          timestamp: new Date().toISOString(),
          currentMatchday: season.currentMatchday,
          savedMatchweek: latestSaved,
          allTeamsComplete: allSameGames
        }, null, 2));
      }
    } catch (error) {
      addCheck('API', 'Connection', false, `Failed: ${error.message}`);
    }
  }

  // ============================================================
  // 5. DISCORD WEBHOOK
  // ============================================================
  console.log('[5/7] Checking Discord webhook...');

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (webhookUrl) {
    const isValidFormat = webhookUrl.startsWith('https://discord.com/api/webhooks/');
    addCheck('Discord', 'Webhook URL format', isValidFormat, isValidFormat ? 'Valid' : 'Invalid format');
  }

  // ============================================================
  // 6. SUPABASE CONNECTION
  // ============================================================
  console.log('[6/7] Checking Supabase configuration...');

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    const isValidUrl = supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co');
    const hasValidKey = supabaseKey.length > 20; // Basic sanity check

    addCheck('Supabase', 'URL format', isValidUrl, isValidUrl ? 'Valid Supabase URL' : 'Invalid URL format', isValidUrl ? 'error' : 'warning');
    addCheck('Supabase', 'Anon key', hasValidKey, hasValidKey ? 'Key configured' : 'Key too short', hasValidKey ? 'error' : 'warning');
  } else {
    addCheck('Supabase', 'Configuration', false, 'Missing Supabase credentials', 'warning');
  }

  // ============================================================
  // 7. GENERATE REPORT
  // ============================================================
  console.log('[7/7] Generating report...');
  console.log();

  // Print summary
  console.log('='.repeat(60));
  console.log('HEALTH CHECK RESULTS');
  console.log('='.repeat(60));

  const categories = [...new Set(checks.map(c => c.category))];
  categories.forEach(category => {
    console.log(`\n[${category}]`);
    checks.filter(c => c.category === category).forEach(check => {
      const icon = check.passed ? '✅' : (check.severity === 'warning' ? '⚠️' : '❌');
      console.log(`${icon} ${check.name}: ${check.message}`);
    });
  });

  console.log();
  console.log('='.repeat(60));
  console.log(`OVERALL STATUS: ${overallStatus}`);
  console.log('='.repeat(60));

  // Send to Discord
  const passedCount = checks.filter(c => c.passed).length;
  const failedCount = checks.filter(c => !c.passed && c.severity === 'error').length;
  const warningCount = checks.filter(c => !c.passed && c.severity === 'warning').length;

  const embed = {
    title: `🏥 System Health Check`,
    color: overallStatus === 'HEALTHY' ? 0x00ff00 : overallStatus === 'WARNING' ? 0xffaa00 : 0xff0000,
    fields: [
      { name: 'Status', value: overallStatus, inline: true },
      { name: 'Passed', value: `${passedCount}`, inline: true },
      { name: 'Failed', value: `${failedCount}`, inline: true },
    ],
    timestamp: new Date().toISOString()
  };

  // Add failed checks to Discord message
  const failedChecks = checks.filter(c => !c.passed);
  if (failedChecks.length > 0) {
    const failedList = failedChecks.map(c => `${c.severity === 'warning' ? '⚠️' : '❌'} ${c.category}: ${c.name} - ${c.message}`).join('\n');
    embed.fields.push({ name: 'Issues', value: failedList.substring(0, 1024) });
  }

  try {
    await fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] })
    });
    console.log('✅ Health report sent to Discord');
  } catch (error) {
    console.error('❌ Failed to send Discord notification:', error.message);
  }

  // Exit with appropriate code
  process.exit(overallStatus === 'HEALTHY' ? 0 : 1);
}

runHealthCheck().catch(error => {
  console.error('FATAL ERROR:', error);
  process.exit(1);
});

// validateStandings.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust this if you move the data file
const filePath = path.resolve(__dirname, 'src/data/standingsByGameweek.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const lastUpdated = data.lastUpdated || "unknown";

// Get all gameweek keys that are numbers
const gameweekNumbers = Object.keys(data)
  .filter(k => !isNaN(k))
  .map(Number);

// Get most recent gameweek
const mostRecentWeek = Math.max(...gameweekNumbers);
const weekData = data[mostRecentWeek];

// Expected team list (alphabetical)
const expectedTeams = [
  "AFC Bournemouth", "Arsenal", "Aston Villa", "Brentford", "Brighton & Hove Albion", "Burnley",
  "Chelsea", "Crystal Palace", "Everton", "Fulham", "Leeds United", "Liverpool",
  "Manchester City", "Manchester United", "Newcastle United", "Nottingham Forest", "Sunderland",
  "Tottenham Hotspur", "West Ham United", "Wolverhampton Wanderers"
];

// Validate teams
const teamSet = new Set(Object.values(weekData));
const allTeamsPresent = expectedTeams.every(t => teamSet.has(t));
const noExtraTeams = teamSet.size === expectedTeams.length;

// Validate ranks
const rankSet = new Set(Object.keys(weekData).map(Number));
const allRanksPresent = [...Array(20).keys()].map(i => i + 1).every(n => rankSet.has(n));

console.log(`📅 Most recent gameweek: ${mostRecentWeek}`);
console.log(`🕒 Last updated: ${lastUpdated}`);
console.log(`✅ Teams valid: ${allTeamsPresent && noExtraTeams}`);
console.log(`✅ Ranks valid: ${allRanksPresent}`);

// If invalid, show diagnostics
if (!allTeamsPresent || !noExtraTeams) {
  const missingTeams = expectedTeams.filter(t => !teamSet.has(t));
  const extraTeams = [...teamSet].filter(t => !expectedTeams.includes(t));
  console.log(`❌ Missing teams:`, missingTeams);
  console.log(`❌ Unexpected teams:`, extraTeams);
}
if (!allRanksPresent) {
  const missingRanks = [...Array(20).keys()].map(i => i + 1).filter(n => !rankSet.has(n));
  console.log(`❌ Missing ranks:`, missingRanks);
}
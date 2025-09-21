// update-standings.js
const fs = require("fs");
const path = require("path");
const readlineSync = require("readline-sync");

const filePath = path.resolve(__dirname, "src/data/standingsByGameweek.json");
const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

// Get current max gameweek and increment
const existingWeeks = Object.keys(data)
  .filter(k => !isNaN(k))
  .map(Number);
const nextWeek = existingWeeks.length > 0 ? Math.max(...existingWeeks) + 1 : 1;

console.log(`\n📋 Enter standings for Gameweek ${nextWeek}:\n`);

const teamList = [
  "Arsenal", "Aston Villa", "Brentford", "Brighton & Hove Albion", "Burnley",
  "Chelsea", "Crystal Palace", "Everton", "Fulham", "Leeds United",
  "Liverpool", "Manchester City", "Manchester United", "Newcastle United",
  "Nottingham Forest", "Sunderland", "Tottenham Hotspur", "West Ham United",
  "Wolverhampton Wanderers", "AFC Bournemouth"
];

let weekData = {};

teamList.forEach(team => {
  let rank = readlineSync.questionInt(`Rank of ${team}: `);
  while (
    rank < 1 || rank > 20 || Object.keys(weekData).includes(rank.toString())
  ) {
    console.log("❌ Invalid or duplicate rank. Please enter a unique number 1–20.");
    rank = readlineSync.questionInt(`Rank of ${team}: `);
  }
  weekData[rank] = team;
});

// Save the updated object
data[nextWeek] = weekData;
data.lastUpdated = new Date().toISOString();

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log(`\n✅ Gameweek ${nextWeek} added and saved to standingsByGameweek.json.`);

// Now compute and store competition scores for this week
;(async () => {
  try {
    // Load scoring function (ESM) dynamically
    const { calculateCompetitionScoresForWeek } = await import(path.resolve(__dirname, 'src/data/competitionData.js'));
    // Read existing scores JSON
    const scoresPath = path.resolve(__dirname, 'src/data/scoresByGameweek.json');
    let scoresData = {};
    if (fs.existsSync(scoresPath)) {
      scoresData = JSON.parse(fs.readFileSync(scoresPath, 'utf8'));
    }
    // Calculate and store
    const weekScores = calculateCompetitionScoresForWeek(nextWeek);
    scoresData[nextWeek] = weekScores;
    scoresData.lastUpdated = new Date().toISOString();
    fs.writeFileSync(scoresPath, JSON.stringify(scoresData, null, 2));
    console.log(`✅ Scores for Gameweek ${nextWeek} saved to scoresByGameweek.json.`);
  } catch (err) {
    console.error('Error computing or saving scores:', err);
  }
})();
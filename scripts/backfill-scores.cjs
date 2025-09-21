// backfill-scores.cjs
// This script backfills scoresByGameweek.json for all existing gameweeks.
const fs = require('fs');
const path = require('path');

;(async () => {
   try {
     const standingsPath = path.resolve(__dirname, '../src/data/standingsByGameweek.json');
     const scoresPath = path.resolve(__dirname, '../src/data/scoresByGameweek.json');

     const standingsData = JSON.parse(fs.readFileSync(standingsPath, 'utf8'));
     const weekKeys = Object.keys(standingsData).filter(k => /^\d+$/.test(k)).map(n => parseInt(n, 10));

     // Load scoring function dynamically
     const { calculateCompetitionScoresForWeek } = await import(path.resolve(__dirname, '../src/data/competitionData.js'));

     let scoresData = {};
     if (fs.existsSync(scoresPath)) {
       scoresData = JSON.parse(fs.readFileSync(scoresPath, 'utf8'));
     }

     for (const week of weekKeys) {
       console.log(`Backfilling scores for GW${week}...`);
       const weekScores = calculateCompetitionScoresForWeek(week);
       scoresData[week] = weekScores;
     }

     scoresData.lastUpdated = new Date().toISOString();
     fs.writeFileSync(scoresPath, JSON.stringify(scoresData, null, 2));
     console.log(`\n✅ Backfilled scores for weeks: ${weekKeys.join(', ')}.`);
   } catch (err) {
     console.error('Error backfilling scores:', err);
     process.exit(1);
   }
})();
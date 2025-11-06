// regenerate-scores.cjs
// Regenerate scores for all gameweeks that have standings data
const fs = require('fs');
const path = require('path');

;(async () => {
  try {
    // Import the ESM module
    const { calculateCompetitionScoresForWeek } = await import(path.resolve(__dirname, 'src/data/competitionData.js'));

    // Read standings to see what weeks we have
    const standingsPath = path.resolve(__dirname, 'src/data/standingsByGameweek.json');
    const standingsData = JSON.parse(fs.readFileSync(standingsPath, 'utf8'));

    const availableWeeks = Object.keys(standingsData)
      .filter(k => !isNaN(k))
      .map(Number)
      .sort((a, b) => a - b);

    console.log(`Found standings for weeks: ${availableWeeks.join(', ')}`);

    // Read existing scores
    const scoresPath = path.resolve(__dirname, 'src/data/scoresByGameweek.json');
    let scoresData = {};
    if (fs.existsSync(scoresPath)) {
      scoresData = JSON.parse(fs.readFileSync(scoresPath, 'utf8'));
    }

    const existingScoreWeeks = Object.keys(scoresData)
      .filter(k => !isNaN(k))
      .map(Number);

    console.log(`Existing scores for weeks: ${existingScoreWeeks.join(', ')}`);

    // Calculate scores for all weeks
    for (const week of availableWeeks) {
      console.log(`\nCalculating scores for Gameweek ${week}...`);
      const weekScores = calculateCompetitionScoresForWeek(week);
      scoresData[week] = weekScores;
      console.log(`✅ Scores calculated for Gameweek ${week}`);
    }

    scoresData.lastUpdated = new Date().toISOString();

    // Write updated scores
    fs.writeFileSync(scoresPath, JSON.stringify(scoresData, null, 2));
    console.log(`\n✅ All scores saved to scoresByGameweek.json`);
    console.log(`Total gameweeks: ${availableWeeks.length}`);

  } catch (err) {
    console.error('Error regenerating scores:', err);
    process.exit(1);
  }
})();

// compare-weeks.cjs
// Compares player standings between two gameweeks
const fs = require("fs");
const path = require("path");

const scoresPath = path.resolve(__dirname, "src/data/scoresByGameweek.json");

/**
 * Compare player standings between two gameweeks
 * @param {number} weekA - Earlier gameweek
 * @param {number} weekB - Later gameweek
 * @param {string} groupFilter - Optional group filter ('all', 'LIV', 'TOG', 'FPL')
 */
function compareWeeks(weekA, weekB, groupFilter = 'all') {
  if (!fs.existsSync(scoresPath)) {
    console.error('❌ scoresByGameweek.json not found.');
    return;
  }

  const scoresData = JSON.parse(fs.readFileSync(scoresPath, 'utf8'));

  if (!scoresData[weekA]) {
    console.error(`❌ No data found for Gameweek ${weekA}`);
    return;
  }

  if (!scoresData[weekB]) {
    console.error(`❌ No data found for Gameweek ${weekB}`);
    return;
  }

  // Filter by group if needed
  let playersWeekA = scoresData[weekA];
  let playersWeekB = scoresData[weekB];

  if (groupFilter !== 'all') {
    playersWeekA = playersWeekA.filter(p => p.groups.includes(groupFilter));
    playersWeekB = playersWeekB.filter(p => p.groups.includes(groupFilter));
  }

  // Create lookup maps
  const weekALookup = new Map();
  playersWeekA.forEach((player, index) => {
    weekALookup.set(player.name, {
      position: index + 1,
      totalScore: player.totalScore
    });
  });

  // Build comparison data
  const comparisons = playersWeekB.map((player, index) => {
    const currentPosition = index + 1;
    const currentScore = player.totalScore;
    const previousData = weekALookup.get(player.name);

    if (!previousData) {
      return {
        name: player.name,
        currentPosition,
        currentScore,
        previousPosition: null,
        previousScore: null,
        positionChange: null,
        scoreChange: null
      };
    }

    return {
      name: player.name,
      currentPosition,
      currentScore,
      previousPosition: previousData.position,
      previousScore: previousData.totalScore,
      positionChange: previousData.position - currentPosition, // Positive = moved up
      scoreChange: currentScore - previousData.totalScore // Negative = improved (lower score is better)
    };
  });

  return comparisons;
}

/**
 * Display comparison results in a formatted table
 */
function displayComparison(weekA, weekB, groupFilter = 'all') {
  const comparisons = compareWeeks(weekA, weekB, groupFilter);

  if (!comparisons) return;

  const groupText = groupFilter === 'all' ? 'All Players' : `Group: ${groupFilter}`;

  console.log(`\n${'='.repeat(80)}`);
  console.log(`📊 LEADERBOARD COMPARISON: Gameweek ${weekA} → Gameweek ${weekB}`);
  console.log(`   ${groupText}`);
  console.log(`${'='.repeat(80)}\n`);

  console.log('Rank | Player                    | Score | Prev Rank | Prev Score | Δ Rank | Δ Score');
  console.log('-'.repeat(88));

  comparisons.forEach(player => {
    const rank = player.currentPosition.toString().padStart(4);
    const name = player.name.padEnd(25);
    const score = player.currentScore.toString().padStart(5);

    const prevRank = player.previousPosition !== null
      ? player.previousPosition.toString().padStart(9)
      : '    -    ';

    const prevScore = player.previousScore !== null
      ? player.previousScore.toString().padStart(10)
      : '     -    ';

    let posChange = '';
    if (player.positionChange !== null) {
      if (player.positionChange > 0) {
        posChange = `↑${player.positionChange}`.padStart(8);
      } else if (player.positionChange < 0) {
        posChange = `↓${Math.abs(player.positionChange)}`.padStart(8);
      } else {
        posChange = '   -    ';
      }
    } else {
      posChange = '   -    ';
    }

    let scoreChange = '';
    if (player.scoreChange !== null) {
      if (player.scoreChange < 0) {
        // Negative score change is good (improvement)
        scoreChange = `${player.scoreChange}`.padStart(9);
      } else if (player.scoreChange > 0) {
        // Positive score change is bad (worse)
        scoreChange = `+${player.scoreChange}`.padStart(9);
      } else {
        scoreChange = '    0    ';
      }
    } else {
      scoreChange = '    -    ';
    }

    console.log(`${rank} | ${name} | ${score} | ${prevRank} | ${prevScore} | ${posChange} | ${scoreChange}`);
  });

  console.log('\n' + '='.repeat(80));

  // Show biggest movers
  const movers = comparisons
    .filter(p => p.positionChange !== null)
    .sort((a, b) => Math.abs(b.positionChange) - Math.abs(a.positionChange))
    .slice(0, 3);

  if (movers.length > 0) {
    console.log('\n🎯 BIGGEST POSITION CHANGES:');
    movers.forEach((player, i) => {
      const arrow = player.positionChange > 0 ? '↑' : '↓';
      console.log(`   ${i + 1}. ${player.name}: ${arrow}${Math.abs(player.positionChange)} positions`);
    });
  }

  // Show biggest score improvers (most negative change)
  const improvers = comparisons
    .filter(p => p.scoreChange !== null)
    .sort((a, b) => a.scoreChange - b.scoreChange)
    .slice(0, 3);

  if (improvers.length > 0 && improvers[0].scoreChange < 0) {
    console.log('\n📉 BIGGEST SCORE IMPROVEMENTS (Lower is Better):');
    improvers.forEach((player, i) => {
      console.log(`   ${i + 1}. ${player.name}: ${player.scoreChange} points`);
    });
  }

  // Show biggest score decliners (most positive change)
  const decliners = comparisons
    .filter(p => p.scoreChange !== null)
    .sort((a, b) => b.scoreChange - a.scoreChange)
    .slice(0, 3);

  if (decliners.length > 0 && decliners[0].scoreChange > 0) {
    console.log('\n📈 BIGGEST SCORE DECLINES (Higher Score = Worse):');
    decliners.forEach((player, i) => {
      console.log(`   ${i + 1}. ${player.name}: +${player.scoreChange} points`);
    });
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

// Export for use in other scripts
module.exports = { compareWeeks, displayComparison };

// Allow running directly from command line
if (require.main === module) {
  const args = process.argv.slice(2);

  let weekA, weekB, group;

  // If no arguments provided, use the two most recent weeks
  if (args.length === 0) {
    const scoresData = JSON.parse(fs.readFileSync(scoresPath, 'utf8'));
    const weeks = Object.keys(scoresData)
      .filter(k => !isNaN(k))
      .map(Number)
      .sort((a, b) => a - b);

    if (weeks.length < 2) {
      console.error('❌ Need at least 2 gameweeks of data to compare.');
      process.exit(1);
    }

    weekB = weeks[weeks.length - 1]; // Most recent week
    weekA = weeks[weeks.length - 2]; // Previous week
    group = 'all';

    console.log(`📊 Comparing most recent weeks: ${weekA} → ${weekB}\n`);
  } else if (args.length < 2) {
    console.log('Usage: node compare-weeks.cjs [weekA] [weekB] [group]');
    console.log('');
    console.log('Examples:');
    console.log('  node compare-weeks.cjs              # Compare last two weeks automatically');
    console.log('  node compare-weeks.cjs 9 10         # Compare weeks 9 and 10, all players');
    console.log('  node compare-weeks.cjs 9 10 LIV     # Compare weeks 9 and 10, LIV group only');
    process.exit(1);
  } else {
    weekA = parseInt(args[0]);
    weekB = parseInt(args[1]);
    group = args[2] || 'all';
  }

  displayComparison(weekA, weekB, group);
}

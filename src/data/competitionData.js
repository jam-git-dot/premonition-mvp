// src/data/competitionData.js
// Real competition data and scoring for Premonition dashboard

// Current Premier League table after MW4
export const currentStandings = {
  1: "Liverpool",
  2: "Arsenal", 
  3: "Tottenham Hotspur",
  4: "AFC Bournemouth",
  5: "Chelsea",
  6: "Everton",
  7: "Sunderland", 
  8: "Manchester City",
  9: "Crystal Palace",
  10: "Newcastle United",
  11: "Fulham",
  12: "Brentford",
  13: "Brighton & Hove Albion",
  14: "Manchester United",
  15: "Nottingham Forest",
  16: "Leeds United",
  17: "Burnley",
  18: "West Ham United",
  19: "Aston Villa",
  20: "Wolverhampton Wanderers"
};

// Real predictions from your 24 friends (exact data from CSV + manual additions)
export const realPredictions = [
  {
    name: "Nick C",
    groups: ["LIV"], // Can add "TOG" here if he's in both: ["LIV", "TOG"]
    rankings: ["Liverpool","Manchester City","Arsenal","Chelsea","Manchester United","Tottenham Hotspur","Aston Villa","Nottingham Forest","Crystal Palace","Newcastle United","Brighton & Hove Albion","Everton","Fulham","West Ham United","AFC Bournemouth","Wolverhampton Wanderers","Brentford","Leeds United","Sunderland","Burnley"]
  },
  {
    name: "Kurt R",
    groups: ["LIV"],
    rankings: ["Liverpool","Arsenal","Chelsea","Manchester City","Aston Villa","Brighton & Hove Albion","Newcastle United","Tottenham Hotspur","Crystal Palace","AFC Bournemouth","Nottingham Forest","Manchester United","Everton","Fulham","Brentford","West Ham United","Wolverhampton Wanderers","Burnley","Sunderland","Leeds United"]
  },
  {
    name: "Johnny Mancini",
    groups: ["LIV", "TOG"], // Example of dual group membership
    rankings: ["Liverpool","Manchester City","Arsenal","Chelsea","Tottenham Hotspur","Newcastle United","Brighton & Hove Albion","Manchester United","Aston Villa","Fulham","Crystal Palace","Nottingham Forest","AFC Bournemouth","Everton","Brentford","West Ham United","Sunderland","Wolverhampton Wanderers","Leeds United","Burnley"]
  },
  {
    name: "Arzan",
    groups: ["LIV"],
    rankings: ["Liverpool","Manchester City","Chelsea","Arsenal","Aston Villa","Newcastle United","Tottenham Hotspur","Brighton & Hove Albion","Manchester United","Everton","Crystal Palace","Nottingham Forest","Brentford","Fulham","AFC Bournemouth","West Ham United","Wolverhampton Wanderers","Leeds United","Burnley","Sunderland"]
  },
  {
    name: "Emmett",
    groups: ["LIV"],
    rankings: ["Liverpool","Manchester City","Arsenal","Chelsea","Newcastle United","Aston Villa","Tottenham Hotspur","Nottingham Forest","Brighton & Hove Albion","Manchester United","AFC Bournemouth","Crystal Palace","Brentford","Everton","Fulham","West Ham United","Wolverhampton Wanderers","Leeds United","Burnley","Sunderland"]
  },
  {
    name: "John Nickodemus",
    groups: ["LIV"],
    rankings: ["Liverpool","Arsenal","Manchester City","Chelsea","Aston Villa","Newcastle United","Brighton & Hove Albion","Fulham","Tottenham Hotspur","Crystal Palace","Everton","West Ham United","AFC Bournemouth","Brentford","Manchester United","Nottingham Forest","Wolverhampton Wanderers","Burnley","Leeds United","Sunderland"]
  },
  {
    name: "Reed Widdoes",
    groups: ["FPL"],
    rankings: ["Arsenal","Chelsea","Manchester City","Liverpool","Newcastle United","Aston Villa","Tottenham Hotspur","Manchester United","Crystal Palace","Brighton & Hove Albion","Nottingham Forest","AFC Bournemouth","Brentford","West Ham United","Fulham","Everton","Burnley","Wolverhampton Wanderers","Leeds United","Sunderland"]
  },
  {
    name: "William Brenninkmeyer",
    groups: ["TOG"],
    rankings: ["Manchester City","Arsenal","Chelsea","Liverpool","Tottenham Hotspur","Manchester United","Crystal Palace","Aston Villa","Newcastle United","Nottingham Forest","AFC Bournemouth","Everton","Brentford","Brighton & Hove Albion","Fulham","West Ham United","Sunderland","Wolverhampton Wanderers","Leeds United","Burnley"]
  },
  {
    name: "Thomas Vickery",
    groups: ["FPL"],
    rankings: ["Manchester City","Liverpool","Chelsea","Arsenal","Tottenham Hotspur","Aston Villa","Newcastle United","Brighton & Hove Albion","Manchester United","Crystal Palace","Fulham","Nottingham Forest","West Ham United","AFC Bournemouth","Everton","Brentford","Wolverhampton Wanderers","Burnley","Leeds United","Sunderland"]
  },
  {
    name: "Josh",
    groups: ["TOG"],
    rankings: ["Liverpool","Manchester City","Arsenal","Chelsea","Newcastle United","Tottenham Hotspur","Aston Villa","Brighton & Hove Albion","Manchester United","Crystal Palace","Nottingham Forest","Fulham","AFC Bournemouth","Everton","Brentford","West Ham United","Wolverhampton Wanderers","Burnley","Leeds United","Sunderland"]
  },
  {
    name: "Ryan Conlon",
    groups: ["TOG"],
    rankings: ["Liverpool","Arsenal","Manchester City","Chelsea","Tottenham Hotspur","Newcastle United","Aston Villa","Brighton & Hove Albion","Manchester United","Crystal Palace","Nottingham Forest","Fulham","AFC Bournemouth","Everton","Brentford","West Ham United","Wolverhampton Wanderers","Burnley","Leeds United","Sunderland"]
  },
  {
    name: "Ryan Robinson",
    groups: ["TOG"],
    rankings: ["Manchester City","Liverpool","Arsenal","Chelsea","Newcastle United","Tottenham Hotspur","Aston Villa","Brighton & Hove Albion","Manchester United","Crystal Palace","Nottingham Forest","Fulham","AFC Bournemouth","Everton","Brentford","West Ham United","Wolverhampton Wanderers","Burnley","Leeds United","Sunderland"]
  },
  {
    name: "Brad McGhee",
    groups: ["TOG", "LIV"], // Example of dual group membership
    rankings: ["Liverpool","Chelsea","Arsenal","Manchester City","Tottenham Hotspur","Newcastle United","Aston Villa","Brighton & Hove Albion","Manchester United","Crystal Palace","Nottingham Forest","Fulham","AFC Bournemouth","Everton","Brentford","West Ham United","Wolverhampton Wanderers","Burnley","Leeds United","Sunderland"]
  },
  {
    name: "Laeka",
    groups: ["TOG"],
    rankings: ["Manchester City","Liverpool","Arsenal","Chelsea","Tottenham Hotspur","Newcastle United","Aston Villa","Brighton & Hove Albion","Manchester United","Crystal Palace","Nottingham Forest","Fulham","AFC Bournemouth","Everton","Brentford","West Ham United","Wolverhampton Wanderers","Burnley","Leeds United","Sunderland"]
  },
  {
    name: "Connor Lance",
    groups: ["TOG"],
    rankings: ["Arsenal","Manchester City","Liverpool","Chelsea","Tottenham Hotspur","Newcastle United","Aston Villa","Brighton & Hove Albion","Manchester United","Crystal Palace","Nottingham Forest","Fulham","AFC Bournemouth","Everton","Brentford","West Ham United","Wolverhampton Wanderers","Burnley","Leeds United","Sunderland"]
  },
  {
    name: "Noah",
    groups: ["TOG"],
    rankings: ["Liverpool","Arsenal","Manchester City","Chelsea","Tottenham Hotspur","Newcastle United","Aston Villa","Brighton & Hove Albion","Manchester United","Crystal Palace","Nottingham Forest","Fulham","AFC Bournemouth","Everton","Brentford","West Ham United","Wolverhampton Wanderers","Burnley","Leeds United","Sunderland"]
  },
  {
    name: "Yeas",
    groups: ["LIV"],
    rankings: ["Liverpool","Arsenal","Chelsea","Manchester City","Tottenham Hotspur","Newcastle United","Aston Villa","Brighton & Hove Albion","Manchester United","Crystal Palace","Nottingham Forest","Fulham","AFC Bournemouth","Everton","Brentford","West Ham United","Wolverhampton Wanderers","Burnley","Leeds United","Sunderland"]
  },
  {
    name: "Owen Curran",
    groups: ["LIV"],
    rankings: ["Liverpool","Arsenal","Newcastle United","Manchester City","Chelsea","Tottenham Hotspur","Aston Villa","Brighton & Hove Albion","Manchester United","Crystal Palace","Nottingham Forest","Fulham","AFC Bournemouth","Everton","Brentford","West Ham United","Wolverhampton Wanderers","Burnley","Leeds United","Sunderland"]
  },
  {
    name: "Logan Whalley",
    groups: ["TOG"],
    rankings: ["Liverpool","Manchester City","Arsenal","Chelsea","Tottenham Hotspur","Newcastle United","Aston Villa","Brighton & Hove Albion","Manchester United","Crystal Palace","Nottingham Forest","Fulham","AFC Bournemouth","Everton","Brentford","West Ham United","Wolverhampton Wanderers","Burnley","Leeds United","Sunderland"]
  },
  {
    name: "Blake",
    groups: ["TOG"],
    rankings: ["Liverpool","Manchester City","Arsenal","Chelsea","Tottenham Hotspur","Newcastle United","Aston Villa","Brighton & Hove Albion","Manchester United","Crystal Palace","Nottingham Forest","Fulham","AFC Bournemouth","Everton","Brentford","West Ham United","Wolverhampton Wanderers","Burnley","Leeds United","Sunderland"]
  },
  {
    name: "Max (PL)",
    groups: ["TOG"],
    rankings: ["Manchester City","Arsenal","Liverpool","Chelsea","Tottenham Hotspur","Newcastle United","Aston Villa","Brighton & Hove Albion","Manchester United","Crystal Palace","Nottingham Forest","Fulham","AFC Bournemouth","Everton","Brentford","West Ham United","Wolverhampton Wanderers","Burnley","Leeds United","Sunderland"]
  },
  {
    name: "Bobby (PL)",
    groups: ["TOG"],
    rankings: ["Liverpool","Manchester City","Arsenal","Chelsea","Tottenham Hotspur","Newcastle United","Aston Villa","Brighton & Hove Albion","Manchester United","Crystal Palace","Nottingham Forest","Fulham","AFC Bournemouth","Everton","Brentford","West Ham United","Wolverhampton Wanderers","Burnley","Leeds United","Sunderland"]
  },
  {
    name: "Alex Riesterer",
    groups: ["TOG"],
    rankings: ["Liverpool","Arsenal","Manchester City","Chelsea","Tottenham Hotspur","Newcastle United","Aston Villa","Brighton & Hove Albion","Manchester United","Crystal Palace","Nottingham Forest","Fulham","AFC Bournemouth","Everton","Brentford","West Ham United","Wolverhampton Wanderers","Burnley","Leeds United","Sunderland"]
  },
  {
    name: "James Nutter",
    groups: ["LIV"],
    rankings: ["Liverpool","Chelsea","Manchester City","Arsenal","Manchester United","Tottenham Hotspur","Newcastle United","Aston Villa","Nottingham Forest","Brentford","Everton","AFC Bournemouth","Brighton & Hove Albion","Fulham","Crystal Palace","Sunderland","West Ham United","Burnley","Wolverhampton Wanderers","Leeds United"]
  }
];

// Available groups for filtering
export const availableGroups = [
  { id: "all", name: "All Entries", count: 24 },
  { id: "LIV", name: "Klopptoberfest Only", count: 9 },
  { id: "TOG", name: "Fantrax FPL Only", count: 15 },
  { id: "FPL", name: "FPL Group", count: 2 }
];

// Function to calculate competition scores (with optional group filtering)
export function calculateCompetitionScores(selectedGroup = "all") {
  // Create team position lookup
  const teamCurrentPosition = {};
  Object.entries(currentStandings).forEach(([pos, team]) => {
    teamCurrentPosition[team] = parseInt(pos);
  });

  // Filter predictions by group (supports multiple groups per person)
  const filteredPredictions = selectedGroup === "all" 
    ? realPredictions 
    : realPredictions.filter(prediction => {
        // Check if user is in the selected group
        return prediction.groups.includes(selectedGroup);
      });

  // Calculate scores for each predictor
  const results = filteredPredictions.map(prediction => {
    let totalScore = 0;
    const teamScores = {};

    prediction.rankings.forEach((teamName, index) => {
      const predictedPosition = index + 1;
      const actualPosition = teamCurrentPosition[teamName];
      
      if (actualPosition) {
        const score = Math.abs(predictedPosition - actualPosition);
        totalScore += score;
        teamScores[teamName] = {
          score: score,
          predictedPosition: predictedPosition,
          actualPosition: actualPosition,
          difference: predictedPosition - actualPosition
        };
      }
    });

    return {
      name: prediction.name,
      groups: prediction.groups,
      totalScore: totalScore,
      teamScores: teamScores
    };
  });

  // Sort by total score (lowest = best, like golf)
  return results.sort((a, b) => a.totalScore - b.totalScore);
}

// Get teams ordered by current table position
export function getTeamsInTableOrder() {
  return Object.entries(currentStandings)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([pos, team]) => ({ position: parseInt(pos), name: team }));
}
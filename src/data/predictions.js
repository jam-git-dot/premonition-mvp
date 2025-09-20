// THIS SHOULD NOT BE MODIFIED
// This is just here for testing purposes. In a real app, this data would come from a backend database.
// Each entry represents a user's prediction for the final Premier League standings.
// The "groups" field indicates which group(s) the user belongs to (e.g., "LIV" for Klopptoberfest, "TOG" for ToggaBoys Fantrax.

export const realPredictionsStorage = [
  {
    name: "Nick C",
    groups: ["LIV"], // Can add "TOG" here if he's in both: ["LIV", "TOG"]
    rankings: ["Liverpool","Manchester City","Arsenal","Chelsea","Manchester United","Tottenham Hotspur","Aston Villa","Nottingham Forest","Crystal Palace","Newcastle United","Brighton & Hove Albion","Everton","Fulham","West Ham United","AFC Bournemouth","Wolverhampton Wanderers","Brentford","Leeds United","Sunderland","Burnley"]
    //       -["Liverpool","Manchester City","Arsenal","Chelsea","Manchester United","Tottenham Hotspur","Aston Villa","Nottingham Forest","Crystal Palace","Newcastle United","Brighton & Hove Albion","Everton","Fulham","West Ham United","AFC Bournemouth","Wolverhampton Wanderers","Brentford","Leeds United","Sunderland","Burnley"]
  },
  {
    name: "Kurt R",
    groups: ["LIV"],
    rankings: ["Liverpool","Arsenal","Chelsea","Manchester City","Aston Villa","Brighton & Hove Albion","Newcastle United","Tottenham Hotspur","Crystal Palace","AFC Bournemouth","Nottingham Forest","Manchester United","Everton","Fulham","Brentford","West Ham United","Wolverhampton Wanderers","Burnley","Sunderland","Leeds United"]
    //       -["Liverpool","Arsenal","Chelsea","Manchester City","Aston Villa","Brighton & Hove Albion","Newcastle United","Tottenham Hotspur","Crystal Palace","AFC Bournemouth","Nottingham Forest","Manchester United","Everton","Fulham","Brentford","West Ham United","Wolverhampton Wanderers","Burnley","Sunderland","Leeds United"]  
  },
  {
    name: "Johnny Mancini",
    groups: ["LIV", "TOG"], // Example of dual group membership
    rankings: ["Liverpool","Manchester City","Arsenal","Chelsea","Tottenham Hotspur","Newcastle United","Brighton & Hove Albion","Manchester United","Aston Villa","Fulham","Crystal Palace","Nottingham Forest","AFC Bournemouth","Everton","Brentford","West Ham United","Sunderland","Wolverhampton Wanderers","Leeds United","Burnley"]
    //        ["Liverpool","Manchester City","Arsenal","Chelsea","Tottenham Hotspur","Newcastle United","Brighton & Hove Albion","Manchester United","Aston Villa","Fulham","Crystal Palace","Nottingham Forest","AFC Bournemouth","Everton","Brentford","West Ham United","Sunderland","Wolverhampton Wanderers","Leeds United","Burnley"]
  },
  {
    name: "Arzan",
    groups: ["LIV"],
    rankings: ["Liverpool","Manchester City","Chelsea","Arsenal","Aston Villa","Newcastle United","Tottenham Hotspur","Brighton & Hove Albion","Manchester United","Everton","Crystal Palace","Nottingham Forest","Brentford","Fulham","AFC Bournemouth","West Ham United","Wolverhampton Wanderers","Leeds United","Burnley","Sunderland"]
    //        ["Liverpool","Manchester City","Chelsea","Arsenal","Aston Villa","Newcastle United","Tottenham Hotspur","Brighton & Hove Albion","Manchester United","Everton","Crystal Palace","Nottingham Forest","Brentford","Fulham","AFC Bournemouth","West Ham United","Wolverhampton Wanderers","Leeds United","Burnley","Sunderland"]
  },
  {
    name: "Emmett",
    groups: ["LIV"],
    rankings: ["Liverpool","Manchester City","Arsenal","Chelsea","Newcastle United","Aston Villa","Tottenham Hotspur","Nottingham Forest","Brighton & Hove Albion","Manchester United","AFC Bournemouth","Crystal Palace","Brentford","Everton","Fulham","West Ham United","Wolverhampton Wanderers","Leeds United","Burnley","Sunderland"]
    //        ["Liverpool","Manchester City","Arsenal","Chelsea","Newcastle United","Aston Villa","Tottenham Hotspur","Nottingham Forest","Brighton & Hove Albion","Manchester United","AFC Bournemouth","Crystal Palace","Brentford","Everton","Fulham","West Ham United","Wolverhampton Wanderers","Leeds United","Burnley","Sunderland"]
  },
  {
    name: "John Nickodemus",
    groups: ["LIV"],
    rankings: ["Liverpool","Arsenal","Manchester City","Chelsea","Aston Villa","Newcastle United","Brighton & Hove Albion","Fulham","Tottenham Hotspur","Crystal Palace","Everton","West Ham United","AFC Bournemouth","Brentford","Manchester United","Nottingham Forest","Wolverhampton Wanderers","Burnley","Leeds United","Sunderland"]
    //        ["Liverpool","Arsenal","Manchester City","Chelsea","Aston Villa","Newcastle United","Brighton & Hove Albion","Fulham","Tottenham Hotspur","Crystal Palace","Everton","West Ham United","AFC Bournemouth","Brentford","Manchester United","Nottingham Forest","Wolverhampton Wanderers","Burnley","Leeds United","Sunderland"]
  },
  {
    name: "Reed Widdoes",
    groups: ["FPL"],
    rankings: ["Arsenal","Chelsea","Manchester City","Liverpool","Newcastle United","Aston Villa","Tottenham Hotspur","Manchester United","Crystal Palace","Brighton & Hove Albion","Nottingham Forest","AFC Bournemouth","Brentford","West Ham United","Fulham","Everton","Burnley","Wolverhampton Wanderers","Leeds United","Sunderland"]
    //        ["Arsenal","Chelsea","Manchester City","Liverpool","Newcastle United","Aston Villa","Tottenham Hotspur","Manchester United","Crystal Palace","Brighton & Hove Albion","Nottingham Forest","AFC Bournemouth","Brentford","West Ham United","Fulham","Everton","Burnley","Wolverhampton Wanderers","Leeds United","Sunderland"]
  },
  {
    name: "William Brenninkmeyer",
    groups: ["TOG"],
    rankings: ["Manchester City","Arsenal","Chelsea","Liverpool","Tottenham Hotspur","Manchester United","Crystal Palace","Aston Villa","Newcastle United","Nottingham Forest","AFC Bournemouth","Everton","Brentford","Brighton & Hove Albion","Fulham","West Ham United","Sunderland","Wolverhampton Wanderers","Leeds United","Burnley"]
    //        ["Manchester City","Arsenal","Chelsea","Liverpool","Tottenham Hotspur","Manchester United","Crystal Palace","Aston Villa","Newcastle United","Nottingham Forest","AFC Bournemouth","Everton","Brentford","Brighton & Hove Albion","Fulham","West Ham United","Sunderland","Wolverhampton Wanderers","Leeds United","Burnley"]
  },
  {
    name: "Thomas Vickery",
    groups: ["FPL"],
    rankings: ["Manchester City","Liverpool","Chelsea","Arsenal","Manchester United","Aston Villa","Tottenham Hotspur","Everton","Newcastle United","Fulham","Crystal Palace","West Ham United","Nottingham Forest","Brentford","Brighton & Hove Albion","AFC Bournemouth","Sunderland","Leeds United","Wolverhampton Wanderers","Burnley"]
    //        ["Manchester City","Liverpool","Chelsea","Arsenal","Manchester United","Aston Villa","Tottenham Hotspur","Everton","Newcastle United","Fulham","Crystal Palace","West Ham United","Nottingham Forest","Brentford","Brighton & Hove Albion","AFC Bournemouth","Sunderland","Leeds United","Wolverhampton Wanderers","Burnley"]
  },
  {
    name: "Josh",
    groups: ["TOG"],
    rankings: ["Liverpool","Manchester City","Arsenal","Chelsea","Newcastle United","Aston Villa","Tottenham Hotspur","Nottingham Forest","Manchester United","Fulham","Crystal Palace","AFC Bournemouth","West Ham United","Brighton & Hove Albion","Everton","Wolverhampton Wanderers","Sunderland","Brentford","Leeds United","Burnley"]
    //        ["Liverpool","Manchester City","Arsenal","Chelsea","Newcastle United","Aston Villa","Tottenham Hotspur","Nottingham Forest","Manchester United","Fulham","Crystal Palace","AFC Bournemouth","West Ham United","Brighton & Hove Albion","Everton","Wolverhampton Wanderers","Sunderland","Brentford","Leeds United","Burnley"]
  },
  {
    name: "Ryan Conlon",
    groups: ["TOG"],
    rankings: ["Liverpool","Arsenal","Manchester City","Chelsea","Aston Villa","Manchester United","Tottenham Hotspur","Brighton & Hove Albion","Newcastle United","AFC Bournemouth","Nottingham Forest","Everton","Crystal Palace","Fulham","West Ham United","Brentford","Wolverhampton Wanderers","Leeds United","Sunderland","Burnley"]
    //        ["Liverpool","Arsenal","Manchester City","Chelsea","Aston Villa","Manchester United","Tottenham Hotspur","Brighton & Hove Albion","Newcastle United","AFC Bournemouth","Nottingham Forest","Everton","Crystal Palace","Fulham","West Ham United","Brentford","Wolverhampton Wanderers","Leeds United","Sunderland","Burnley"]
  },
  {
    name: "Ryan Robinson",
    groups: ["TOG"],
    rankings: ["Manchester City","Liverpool","Arsenal","Chelsea","Manchester United","Tottenham Hotspur","Aston Villa","Brighton & Hove Albion","Newcastle United","Nottingham Forest","AFC Bournemouth","Everton","Crystal Palace","West Ham United","Fulham","Wolverhampton Wanderers","Brentford","Leeds United","Burnley","Sunderland"]
    //        ["Manchester City","Liverpool","Arsenal","Chelsea","Manchester United","Tottenham Hotspur","Aston Villa","Brighton & Hove Albion","Newcastle United","Nottingham Forest","AFC Bournemouth","Everton","Crystal Palace","West Ham United","Fulham","Wolverhampton Wanderers","Brentford","Leeds United","Burnley","Sunderland"]
  },
  {
    name: "Brad McGhee",
    groups: ["TOG", "LIV"], // Example of dual group membership
    rankings: ["Liverpool","Chelsea","Arsenal","Manchester City","Manchester United","Aston Villa","Newcastle United","AFC Bournemouth","Nottingham Forest","Brentford","Tottenham Hotspur","Everton","Brighton & Hove Albion","West Ham United","Crystal Palace","Fulham","Leeds United","Burnley","Wolverhampton Wanderers","Sunderland"]
    //        ["Liverpool","Chelsea","Arsenal","Manchester City","Manchester United","Aston Villa","Newcastle United","AFC Bournemouth","Nottingham Forest","Brentford","Tottenham Hotspur","Everton","Brighton & Hove Albion","West Ham United","Crystal Palace","Fulham","Leeds United","Burnley","Wolverhampton Wanderers","Sunderland"]
  },
  {
    name: "Laeka",
    groups: ["TOG"],
    rankings: ["Manchester City","Liverpool","Arsenal","Chelsea","Manchester United","Tottenham Hotspur","Newcastle United","Aston Villa","Brighton & Hove Albion","Nottingham Forest","Everton","Crystal Palace","AFC Bournemouth","Fulham","West Ham United","Brentford","Leeds United","Wolverhampton Wanderers","Sunderland","Burnley"]
    //        ["Manchester City","Liverpool","Arsenal","Chelsea","Manchester United","Tottenham Hotspur","Newcastle United","Aston Villa","Brighton & Hove Albion","Nottingham Forest","Everton","Crystal Palace","AFC Bournemouth","Fulham","West Ham United","Brentford","Leeds United","Wolverhampton Wanderers","Sunderland","Burnley"]
  },
  {
    name: "Connor Lance",
    groups: ["TOG"],
    rankings: ["Arsenal","Manchester City","Liverpool","Chelsea","Aston Villa","Manchester United","Tottenham Hotspur","Newcastle United","AFC Bournemouth","West Ham United","Brighton & Hove Albion","Crystal Palace","Nottingham Forest","Everton","Fulham","Wolverhampton Wanderers","Brentford","Leeds United","Sunderland","Burnley"]
    //        ["Arsenal","Manchester City","Liverpool","Chelsea","Aston Villa","Manchester United","Tottenham Hotspur","Newcastle United","AFC Bournemouth","West Ham United","Brighton & Hove Albion","Crystal Palace","Nottingham Forest","Everton","Fulham","Wolverhampton Wanderers","Brentford","Leeds United","Sunderland","Burnley"]
  },
  {
    name: "Noah",
    groups: ["TOG"],
    rankings: ["Liverpool","Arsenal","Manchester City","Chelsea","Aston Villa","Manchester United","Newcastle United","Brighton & Hove Albion","Tottenham Hotspur","Crystal Palace","Nottingham Forest","West Ham United","Fulham","AFC Bournemouth","Brentford","Everton","Sunderland","Wolverhampton Wanderers","Leeds United","Burnley"]
    //        ["Liverpool","Arsenal","Manchester City","Chelsea","Aston Villa","Manchester United","Newcastle United","Brighton & Hove Albion","Tottenham Hotspur","Crystal Palace","Nottingham Forest","West Ham United","Fulham","AFC Bournemouth","Brentford","Everton","Sunderland","Wolverhampton Wanderers","Leeds United","Burnley"]
  },
  {
    name: "Yeas",
    groups: ["LIV"],
    rankings: ["Liverpool","Arsenal","Chelsea","Manchester City","Aston Villa","Crystal Palace","Manchester United","Newcastle United","Nottingham Forest","AFC Bournemouth","Brentford","Tottenham Hotspur","Brighton & Hove Albion","Fulham","West Ham United","Everton","Sunderland","Wolverhampton Wanderers","Leeds United","Burnley"]
    //        ["Liverpool","Arsenal","Chelsea","Manchester City","Aston Villa","Crystal Palace","Manchester United","Newcastle United","Nottingham Forest","AFC Bournemouth","Brentford","Tottenham Hotspur","Brighton & Hove Albion","Fulham","West Ham United","Everton","Sunderland","Wolverhampton Wanderers","Leeds United","Burnley"]
  },
  {
    name: "Owen Curran",
    groups: ["LIV"],
    rankings: ["Liverpool","Arsenal","Newcastle United","Manchester City","Nottingham Forest","Aston Villa","Chelsea","Manchester United","Brighton & Hove Albion","Burnley","Crystal Palace","Tottenham Hotspur","Everton","Fulham","Leeds United","Sunderland","West Ham United","Wolverhampton Wanderers","Brentford","AFC Bournemouth"]
    //        ["Liverpool","Arsenal","Newcastle United","Manchester City","Nottingham Forest","Aston Villa","Chelsea","Manchester United","Brighton & Hove Albion","Burnley","Crystal Palace","Tottenham Hotspur","Everton","Fulham","Leeds United","Sunderland","West Ham United","Wolverhampton Wanderers","Brentford","AFC Bournemouth"]
  },
  {
    name: "Logan Whalley",
    groups: ["LIV"],
    rankings: ["Liverpool","Manchester City","Arsenal","Chelsea","Aston Villa","Crystal Palace","Manchester United","Brighton & Hove Albion","Nottingham Forest","Newcastle United","Everton","Fulham","Tottenham Hotspur","Wolverhampton Wanderers","West Ham United","Brentford","Sunderland","AFC Bournemouth","Leeds United","Burnley"]
    //        ["Liverpool","Manchester City","Arsenal","Chelsea","Aston Villa","Crystal Palace","Manchester United","Brighton & Hove Albion","Nottingham Forest","Newcastle United","Everton","Fulham","Tottenham Hotspur","Wolverhampton Wanderers","West Ham United","Brentford","Sunderland","AFC Bournemouth","Leeds United","Burnley"]
  },
  {
    name: "Blake",
    groups: ["TOG"],
    rankings: ["Liverpool","Manchester City","Arsenal","Chelsea","Aston Villa","Manchester United","Tottenham Hotspur","Newcastle United","Nottingham Forest","Brighton & Hove Albion","AFC Bournemouth","Crystal Palace","Everton","Fulham","West Ham United","Brentford","Leeds United","Wolverhampton Wanderers","Burnley","Sunderland"]
    //        ["Liverpool","Manchester City","Arsenal","Chelsea","Aston Villa","Manchester United","Tottenham Hotspur","Newcastle United","Nottingham Forest","Brighton & Hove Albion","AFC Bournemouth","Crystal Palace","Everton","Fulham","West Ham United","Brentford","Leeds United","Wolverhampton Wanderers","Burnley","Sunderland"]
  },
  {
    name: "Max (PL)",
    groups: ["TOG"],
    rankings: ["Manchester City","Arsenal","Liverpool","Chelsea","Aston Villa","Newcastle United","Fulham","Crystal Palace","Manchester United","Tottenham Hotspur","AFC Bournemouth","Everton","Brighton & Hove Albion","Nottingham Forest","Wolverhampton Wanderers","Brentford","Leeds United","West Ham United","Sunderland","Burnley"]
    //        ["Manchester City","Arsenal","Liverpool","Chelsea","Aston Villa","Newcastle United","Fulham","Crystal Palace","Manchester United","Tottenham Hotspur","AFC Bournemouth","Everton","Brighton & Hove Albion","Nottingham Forest","Wolverhampton Wanderers","Brentford","Leeds United","West Ham United","Sunderland","Burnley"]
  },
  {
    name: "Bobby (PL)",
    groups: ["TOG"],
    rankings: ["Liverpool","Manchester City","Arsenal","Chelsea","Newcastle United","Aston Villa","Tottenham Hotspur","Manchester United","Nottingham Forest","Crystal Palace","Everton","Brighton & Hove Albion","AFC Bournemouth","West Ham United","Fulham","Brentford","Wolverhampton Wanderers","Leeds United","Sunderland","Burnley"]
    //        ["Liverpool","Manchester City","Arsenal","Chelsea","Newcastle United","Aston Villa","Tottenham Hotspur","Manchester United","Nottingham Forest","Crystal Palace","Everton","Brighton & Hove Albion","AFC Bournemouth","West Ham United","Fulham","Brentford","Wolverhampton Wanderers","Leeds United","Sunderland","Burnley"]
  },
  {
    name: "Alex Riesterer",
    groups: ["TOG"],
    rankings: ["Liverpool","Arsenal","Manchester City","Chelsea","Aston Villa","Manchester United","Newcastle United","Brighton & Hove Albion","Nottingham Forest","Tottenham Hotspur","Everton","AFC Bournemouth","Crystal Palace","Fulham","West Ham United","Brentford","Wolverhampton Wanderers","Leeds United","Sunderland","Burnley"]
    //        ["Liverpool","Arsenal","Manchester City","Chelsea","Aston Villa","Manchester United","Newcastle United","Brighton & Hove Albion","Nottingham Forest","Tottenham Hotspur","Everton","AFC Bournemouth","Crystal Palace","Fulham","West Ham United","Brentford","Wolverhampton Wanderers","Leeds United","Sunderland","Burnley"]
  },
  {
    name: "James Nutter",
    groups: ["LIV"],
    rankings: ["Liverpool","Chelsea","Manchester City","Arsenal","Manchester United","Tottenham Hotspur","Newcastle United","Aston Villa","Nottingham Forest","Brentford","Everton","AFC Bournemouth","Brighton & Hove Albion","Fulham","Crystal Palace","Sunderland","West Ham United","Burnley","Wolverhampton Wanderers","Leeds United"]
    //        ["Liverpool","Chelsea","Manchester City","Arsenal","Manchester United","Tottenham Hotspur","Newcastle United","Aston Villa","Nottingham Forest","Brentford","Everton","AFC Bournemouth","Brighton & Hove Albion","Fulham","Crystal Palace","Sunderland","West Ham United","Burnley","Wolverhampton Wanderers","Leeds United"]
  }
];


import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

/**
 * Send a message to Discord via webhook
 */
async function sendDiscordMessage(embed) {
  if (!WEBHOOK_URL) {
    console.log('⚠️  Discord webhook not configured, skipping notification');
    return;
  }

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: [embed]
      }),
    });

    if (!response.ok) {
      console.error('Failed to send Discord notification:', response.statusText);
    }
  } catch (error) {
    console.error('Error sending Discord notification:', error.message);
  }
}

/**
 * Notify successful standings update
 */
export async function notifySuccess(gameweek, standings, playerComparisons = null, previousStandings = null) {
  const timestamp = new Date().toISOString();

  const fields = [
    {
      name: 'Gameweek',
      value: `GW${gameweek}`,
      inline: true,
    },
    {
      name: 'Teams',
      value: `${standings.length} teams`,
      inline: true,
    },
    {
      name: 'Time',
      value: new Date().toLocaleString('en-US', { timeZone: 'UTC', timeZoneName: 'short' }),
      inline: true,
    },
  ];

  // Calculate and show Premier League team position changes
  if (previousStandings) {
    // Create a map of previous positions: team name -> position
    const prevPositions = {};
    Object.entries(previousStandings).forEach(([pos, team]) => {
      prevPositions[team] = parseInt(pos);
    });

    // Calculate position changes for each team
    const teamChanges = standings.map(({ team, position }) => {
      const prevPos = prevPositions[team];
      if (prevPos !== undefined) {
        return {
          team,
          currentPosition: position,
          previousPosition: prevPos,
          change: prevPos - position // Positive = moved up
        };
      }
      return null;
    }).filter(t => t !== null);

    // Get biggest movers (by absolute change)
    const biggestMovers = teamChanges
      .filter(t => t.change !== 0)
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
      .slice(0, 3);

    if (biggestMovers.length > 0) {
      const moversText = biggestMovers.map(t => {
        const arrow = t.change > 0 ? '↑' : '↓';
        const sign = t.change > 0 ? '+' : '';
        return `${t.team}: ${arrow}${Math.abs(t.change)} (now #${t.currentPosition})`;
      }).join('\n');

      fields.push({
        name: '⚽ Biggest Table Movers',
        value: moversText,
        inline: false,
      });
    }
  }

  // Add player leaderboard changes if available
  if (playerComparisons && playerComparisons.length > 0) {
    // Get biggest position movers
    const movers = playerComparisons
      .filter(p => p.positionChange !== null)
      .sort((a, b) => Math.abs(b.positionChange) - Math.abs(a.positionChange))
      .slice(0, 3);

    if (movers.length > 0 && Math.abs(movers[0].positionChange) > 0) {
      const moversText = movers.map(p => {
        const arrow = p.positionChange > 0 ? '↑' : '↓';
        return `${p.name}: ${arrow}${Math.abs(p.positionChange)} (now #${p.currentPosition})`;
      }).join('\n');

      fields.push({
        name: '🎯 Biggest Position Changes',
        value: moversText,
        inline: false,
      });
    }

    // Get current top 3 players
    const top3Players = playerComparisons
      .slice(0, 3)
      .map((p, idx) => `${idx + 1}. ${p.name} (${p.currentScore} pts)`)
      .join('\n');

    fields.push({
      name: '🏆 Top 3 Players',
      value: top3Players,
      inline: false,
    });
  }

  const embed = {
    title: '✅ Standings Updated Successfully',
    color: 0x00ff00, // Green
    fields,
    timestamp,
  };

  await sendDiscordMessage(embed);
}

/**
 * Notify gap detection (missed gameweeks)
 */
export async function notifyGap(missedGameweeks) {
  const timestamp = new Date().toISOString();
  const gwList = missedGameweeks.map(gw => `GW${gw}`).join(', ');

  const embed = {
    title: '⚠️ GAP DETECTED - Action Required',
    color: 0xffaa00, // Orange/Yellow
    description: `The automation skipped gameweek(s) because multiple gameweeks completed between runs.`,
    fields: [
      {
        name: 'Missed Gameweeks',
        value: gwList,
        inline: false,
      },
      {
        name: 'Action Required',
        value: 'Manual backfill needed. Run the manual override script for each missed gameweek.',
        inline: false,
      },
      {
        name: 'Command',
        value: `\`npm run manual-override:interactive <gameweek>\``,
        inline: false,
      },
    ],
    timestamp,
  };

  await sendDiscordMessage(embed);
}

/**
 * Notify error/failure
 */
export async function notifyError(error, context = {}) {
  const timestamp = new Date().toISOString();

  const fields = [
    {
      name: 'Error',
      value: error.message || String(error),
      inline: false,
    },
    {
      name: 'Time',
      value: new Date().toLocaleString('en-US', { timeZone: 'UTC', timeZoneName: 'short' }),
      inline: true,
    },
  ];

  if (context.gameweek) {
    fields.unshift({
      name: 'Gameweek',
      value: `GW${context.gameweek}`,
      inline: true,
    });
  }

  const embed = {
    title: '❌ Update Failed',
    color: 0xff0000, // Red
    description: 'The system did NOT save any data (fail-safe protection).',
    fields,
    timestamp,
  };

  await sendDiscordMessage(embed);
}

/**
 * Notify manual override completion
 */
export async function notifyManualOverride(gameweek, stats = {}) {
  const timestamp = new Date().toISOString();

  const fields = [
    {
      name: 'Gameweek',
      value: `GW${gameweek}`,
      inline: true,
    },
    {
      name: 'Method',
      value: stats.interactive ? 'Interactive Mode' : 'Command Line',
      inline: true,
    },
    {
      name: 'Time',
      value: new Date().toLocaleString('en-US', { timeZone: 'UTC', timeZoneName: 'short' }),
      inline: true,
    },
  ];

  if (stats.backupCreated !== undefined) {
    fields.push({
      name: 'Backup Created',
      value: stats.backupCreated ? '✅' : '❌',
      inline: true,
    });
  }

  if (stats.validationPassed !== undefined) {
    fields.push({
      name: 'Validation Passed',
      value: stats.validationPassed ? '✅' : '❌',
      inline: true,
    });
  }

  fields.push({
    name: 'Status',
    value: 'SAVED',
    inline: true,
  });

  const embed = {
    title: '🔧 Manual Override Completed',
    color: 0x0099ff, // Blue
    fields,
    timestamp,
  };

  await sendDiscordMessage(embed);
}

/**
 * Notify no action needed (gameweek in progress)
 */
export async function notifyNoAction(reason, details = {}) {
  const timestamp = new Date().toISOString();

  const fields = [
    {
      name: 'Reason',
      value: reason,
      inline: false,
    },
  ];

  if (details.currentGameweek) {
    fields.push({
      name: 'Current Gameweek',
      value: `GW${details.currentGameweek}`,
      inline: true,
    });
  }

  if (details.gamesPlayed) {
    fields.push({
      name: 'Games Played',
      value: details.gamesPlayed,
      inline: true,
    });
  }

  const embed = {
    title: 'ℹ️ No Action Taken',
    color: 0x808080, // Gray
    fields,
    timestamp,
  };

  await sendDiscordMessage(embed);
}

/**
 * Football-Data.org API Client
 *
 * Wrapper for interacting with the Football-Data.org API.
 * Handles authentication, rate limiting, and error handling.
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const API_KEY = process.env.FOOTBALL_API_KEY;
const BASE_URL = 'https://api.football-data.org/v4';
const COMPETITION_ID = 'PL'; // Premier League

// API Configuration
export const API_LIMITS = {
  callsPerMinute: 10,
  expectedUsage: 'few calls per week'
};

// Track API calls for logging
let apiCallCount = 0;

/**
 * Makes an authenticated request to the Football-Data.org API
 * @param {string} endpoint - API endpoint (e.g., '/competitions/PL/standings')
 * @param {number} retries - Number of retry attempts on network failure
 * @returns {Promise<Object>} API response data
 * @throws {Error} On API failure after retries
 */
async function makeApiRequest(endpoint, retries = 3) {
  const url = `${BASE_URL}${endpoint}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Auth-Token': API_KEY
        }
      });

      apiCallCount++;

      // Check rate limit headers
      const rateLimitRemaining = response.headers.get('X-Requests-Available-Minute');
      if (rateLimitRemaining !== null) {
        console.log(`API calls remaining this minute: ${rateLimitRemaining}/${API_LIMITS.callsPerMinute}`);
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed (${response.status}): ${errorText}`);
      }

      return await response.json();

    } catch (error) {
      if (attempt === retries) {
        throw new Error(`API request failed after ${retries} attempts: ${error.message}`);
      }

      // Exponential backoff: wait 1s, 2s, 4s, etc.
      const waitTime = Math.pow(2, attempt - 1) * 1000;
      console.log(`Request failed, retrying in ${waitTime}ms... (attempt ${attempt}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

/**
 * Fetches current Premier League standings
 * @returns {Promise<Object>} Standings data with season info and table
 */
export async function getCurrentStandings() {
  console.log('Fetching current Premier League standings...');

  const data = await makeApiRequest(`/competitions/${COMPETITION_ID}/standings`);

  if (!data.standings || data.standings.length === 0) {
    throw new Error('No standings data returned from API');
  }

  return {
    season: data.season,
    standings: data.standings[0].table // Main league table
  };
}

/**
 * Gets the number of API calls made this session
 * @returns {number} API call count
 */
export function getApiCallCount() {
  return apiCallCount;
}

/**
 * Resets the API call counter
 */
export function resetApiCallCount() {
  apiCallCount = 0;
}

/**
 * Validates API key is configured
 * @throws {Error} If API key is missing
 */
export function validateApiKey() {
  if (!API_KEY) {
    throw new Error('FOOTBALL_API_KEY not found in .env.local. Please add your API key.');
  }
}

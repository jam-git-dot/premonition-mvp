// Validation utilities for user input

/**
 * Validate email address with proper regex
 * @param {string} email - Email to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }

  const trimmed = email.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Email cannot be empty' };
  }

  if (trimmed.length > 254) {
    return { valid: false, error: 'Email is too long (max 254 characters)' };
  }

  // More comprehensive email regex
  // Allows: user@domain.com, user.name@domain.co.uk, user+tag@domain.com
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }

  return { valid: true, error: null };
}

/**
 * Validate user name
 * @param {string} name - Name to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Name is required' };
  }

  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Name cannot be empty' };
  }

  if (trimmed.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: 'Name is too long (max 100 characters)' };
  }

  // Check for suspicious patterns (SQL injection attempts, XSS)
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i, // onclick=, onload=, etc.
    /['";]/g, // Excessive quotes
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(trimmed)) {
      return { valid: false, error: 'Name contains invalid characters' };
    }
  }

  return { valid: true, error: null };
}

/**
 * Validate team rankings
 * @param {Array} rankings - Array of team objects
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateRankings(rankings) {
  if (!Array.isArray(rankings)) {
    return { valid: false, error: 'Rankings must be an array' };
  }

  if (rankings.length !== 20) {
    return { valid: false, error: `Must rank all 20 teams (currently have ${rankings.length})` };
  }

  // Extract team names
  const teamNames = rankings.map(team =>
    typeof team === 'string' ? team : team.name
  );

  // Check for duplicates
  const uniqueTeams = new Set(teamNames);
  if (uniqueTeams.size !== 20) {
    return { valid: false, error: 'Duplicate teams found in rankings' };
  }

  // Check for empty/invalid team names
  for (const teamName of teamNames) {
    if (!teamName || typeof teamName !== 'string' || teamName.trim().length === 0) {
      return { valid: false, error: 'Invalid team name in rankings' };
    }
  }

  return { valid: true, error: null };
}

/**
 * Sanitize string input to prevent XSS
 * @param {string} input - String to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';

  return input
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate entire submission
 * @param {Object} submission - Submission object
 * @returns {{valid: boolean, errors: Array<string>}}
 */
export function validateSubmission(submission) {
  const errors = [];

  // Validate email
  const emailValidation = validateEmail(submission.email);
  if (!emailValidation.valid) {
    errors.push(emailValidation.error);
  }

  // Validate name
  const nameValidation = validateName(submission.name);
  if (!nameValidation.valid) {
    errors.push(nameValidation.error);
  }

  // Validate rankings
  const rankingsValidation = validateRankings(submission.rankings);
  if (!rankingsValidation.valid) {
    errors.push(rankingsValidation.error);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

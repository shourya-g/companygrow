// Utility to calculate a user's portfolio score based on their skills
// You can adjust the formula as needed
export function calculatePortfolioScore(skills) {
  if (!Array.isArray(skills) || skills.length === 0) return 0;
  // Example: sum of (proficiency_level * (is_verified ? 2 : 1))
  return skills.reduce((score, skill) => {
    const proficiency = skill.proficiency_level || 0;
    const verifiedMultiplier = skill.is_verified ? 2 : 1;
    return score + proficiency * verifiedMultiplier;
  }, 0);
}

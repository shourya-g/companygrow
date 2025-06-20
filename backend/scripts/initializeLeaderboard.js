const { User, UserLeaderboardStats } = require('../models');
const LeaderboardService = require('../services/leaderboardService');

async function initializeLeaderboard() {
  try {
    console.log('Initializing leaderboard for existing users...');
    
    const users = await User.findAll();
    
    for (const user of users) {
      // Create initial stats record
      await UserLeaderboardStats.findOrCreate({
        where: { user_id: user.id },
        defaults: {
          user_id: user.id,
          current_month: new Date().getMonth() + 1,
          current_quarter: Math.ceil((new Date().getMonth() + 1) / 3),
          current_year: new Date().getFullYear()
        }
      });
      
      // Update stats based on existing data
      await LeaderboardService.updateUserStats(user.id);
    }
    
    // Update rankings
    await LeaderboardService.updateRankings();
    
    console.log(`✅ Leaderboard initialized for ${users.length} users`);
  } catch (error) {
    console.error('❌ Error initializing leaderboard:', error);
  }
}

// Run if called directly
if (require.main === module) {
  initializeLeaderboard().then(() => process.exit(0));
}

module.exports = initializeLeaderboard;
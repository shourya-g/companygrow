-- Leaderboard Points System
CREATE TABLE leaderboard_points (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    points_type VARCHAR(50) NOT NULL, -- 'course_completion', 'project_completion', 'badge_earned', 'streak_bonus'
    points_earned INTEGER NOT NULL,
    source_id INTEGER, -- ID of the course, project, badge, etc.
    source_type VARCHAR(50), -- 'course', 'project', 'badge'
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Leaderboard Stats (aggregated data for performance)
CREATE TABLE user_leaderboard_stats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    total_points INTEGER DEFAULT 0,
    monthly_points INTEGER DEFAULT 0,
    quarterly_points INTEGER DEFAULT 0,
    courses_completed INTEGER DEFAULT 0,
    projects_completed INTEGER DEFAULT 0,
    badges_earned INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0, -- days of consecutive activity
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    current_month INTEGER DEFAULT EXTRACT(MONTH FROM CURRENT_DATE),
    current_quarter INTEGER DEFAULT EXTRACT(QUARTER FROM CURRENT_DATE),
    current_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    ranking_position INTEGER,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leaderboard Achievements (special milestones)
CREATE TABLE leaderboard_achievements (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    achievement_type VARCHAR(50), -- 'points_milestone', 'streak', 'completion', 'ranking'
    criteria_value INTEGER, -- threshold for achievement
    badge_image VARCHAR(500),
    points_reward INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Achievement Unlocks
CREATE TABLE user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    achievement_id INTEGER REFERENCES leaderboard_achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);

-- Leaderboard Seasons (for periodic competitions)
CREATE TABLE leaderboard_seasons (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    prize_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_leaderboard_points_user_id ON leaderboard_points(user_id);
CREATE INDEX idx_leaderboard_points_created_at ON leaderboard_points(created_at);
CREATE INDEX idx_leaderboard_points_type ON leaderboard_points(points_type);
CREATE INDEX idx_user_leaderboard_stats_total_points ON user_leaderboard_stats(total_points DESC);
CREATE INDEX idx_user_leaderboard_stats_monthly_points ON user_leaderboard_stats(monthly_points DESC);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);

-- Insert default achievements
INSERT INTO leaderboard_achievements (name, description, achievement_type, criteria_value, points_reward) VALUES
('First Steps', 'Complete your first course', 'completion', 1, 50),
('Learning Machine', 'Complete 5 courses', 'completion', 5, 100),
('Course Master', 'Complete 10 courses', 'completion', 10, 200),
('Knowledge Seeker', 'Complete 25 courses', 'completion', 25, 500),
('Project Starter', 'Complete your first project', 'completion', 1, 75),
('Team Player', 'Complete 5 projects', 'completion', 5, 150),
('Project Hero', 'Complete 10 projects', 'completion', 10, 300),
('Rising Star', 'Reach 1000 points', 'points_milestone', 1000, 100),
('High Achiever', 'Reach 5000 points', 'points_milestone', 5000, 250),
('Elite Performer', 'Reach 10000 points', 'points_milestone', 10000, 500),
('Consistent Learner', 'Maintain a 7-day streak', 'streak', 7, 100),
('Dedication Master', 'Maintain a 30-day streak', 'streak', 30, 300),
('Top 10', 'Reach top 10 in leaderboard', 'ranking', 10, 200),
('Top 5', 'Reach top 5 in leaderboard', 'ranking', 5, 400),
('Champion', 'Reach #1 in leaderboard', 'ranking', 1, 1000);

INSERT INTO leaderboard_achievements (name, description, achievement_type, criteria_value, points_reward, rarity) VALUES
('Skill Expert', 'Reach Level 5 in any skill', 'skill_mastery', 5, 100, 'rare'),
('Multi-Skilled', 'Add 10 different skills to your profile', 'skill_count', 10, 150, 'uncommon'),
('Skill Collector', 'Add 25 different skills to your profile', 'skill_count', 25, 300, 'rare'),
('Verified Professional', 'Have 5 skills verified by managers', 'verified_skills', 5, 200, 'epic');
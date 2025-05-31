-- Sample Data for CompanyGrow Database
-- Run this after creating the main schema

-- Insert sample skills
INSERT INTO skills (name, category, description) VALUES
('JavaScript', 'technical', 'Programming language for web development'),
('React', 'technical', 'Frontend JavaScript library'),
('Node.js', 'technical', 'Backend JavaScript runtime'),
('Python', 'technical', 'General purpose programming language'),
('SQL', 'technical', 'Database query language'),
('Project Management', 'soft', 'Planning and executing projects'),
('Communication', 'soft', 'Effective verbal and written communication'),
('Leadership', 'leadership', 'Leading and motivating teams'),
('Problem Solving', 'soft', 'Analytical thinking and troubleshooting'),
('UI/UX Design', 'technical', 'User interface and experience design');

-- Insert sample users (passwords should be hashed in real application)
INSERT INTO users (email, password, first_name, last_name, role, department, position, hire_date) VALUES
('admin@companygrow.com', '$2a$10$example_hashed_password', 'Admin', 'User', 'admin', 'IT', 'System Administrator', '2023-01-15'),
('john.doe@companygrow.com', '$2a$10$example_hashed_password', 'John', 'Doe', 'employee', 'Engineering', 'Software Developer', '2023-03-20'),
('jane.smith@companygrow.com', '$2a$10$example_hashed_password', 'Jane', 'Smith', 'manager', 'Engineering', 'Senior Developer', '2022-08-10'),
('bob.wilson@companygrow.com', '$2a$10$example_hashed_password', 'Bob', 'Wilson', 'employee', 'Design', 'UI/UX Designer', '2023-05-01'),
('alice.brown@companygrow.com', '$2a$10$example_hashed_password', 'Alice', 'Brown', 'employee', 'Marketing', 'Digital Marketer', '2023-02-14');

-- Insert user skills
INSERT INTO user_skills (user_id, skill_id, proficiency_level, years_experience, is_verified) VALUES
(2, 1, 4, 3, true),  -- John: JavaScript
(2, 2, 3, 2, true),  -- John: React
(2, 3, 3, 2, false), -- John: Node.js
(3, 1, 5, 5, true),  -- Jane: JavaScript
(3, 2, 4, 4, true),  -- Jane: React
(3, 8, 4, 3, true),  -- Jane: Leadership
(4, 10, 4, 3, true), -- Bob: UI/UX Design
(4, 7, 3, 2, true),  -- Bob: Communication
(5, 7, 4, 4, true),  -- Alice: Communication
(5, 6, 3, 2, true);  -- Alice: Project Management

-- Insert sample courses
INSERT INTO courses (title, description, category, difficulty_level, duration_hours, instructor_name, is_active, price, created_by) VALUES
('Advanced JavaScript Concepts', 'Deep dive into closures, prototypes, and async programming', 'Programming', 'advanced', 20, 'Sarah Johnson', true, 199.99, 1),
('React Fundamentals', 'Learn React from basics to building complete applications', 'Frontend', 'beginner', 15, 'Mike Chen', true, 149.99, 1),
('Leadership Skills for Tech Teams', 'Develop leadership skills specific to technology teams', 'Leadership', 'intermediate', 12, 'Dr. Patricia Lee', true, 299.99, 1),
('Project Management Essentials', 'Learn agile project management methodologies', 'Management', 'beginner', 18, 'Robert Martinez', true, 179.99, 1),
('UI/UX Design Principles', 'Master the fundamentals of user-centered design', 'Design', 'intermediate', 25, 'Emma Davis', true, 249.99, 1);

-- Link courses with skills they teach
INSERT INTO course_skills (course_id, skill_id, skill_level) VALUES
(1, 1, 4), -- Advanced JS teaches JavaScript to level 4
(2, 2, 3), -- React Fundamentals teaches React to level 3
(3, 8, 3), -- Leadership course teaches Leadership to level 3
(4, 6, 3), -- Project Management teaches PM to level 3
(5, 10, 3); -- UI/UX course teaches Design to level 3

-- Insert sample course enrollments
INSERT INTO course_enrollments (user_id, course_id, status, progress_percentage, enrollment_date) VALUES
(2, 2, 'in_progress', 65, '2024-01-15'),
(2, 1, 'enrolled', 0, '2024-02-01'),
(3, 3, 'completed', 100, '2023-12-01'),
(4, 5, 'in_progress', 40, '2024-01-20'),
(5, 4, 'completed', 100, '2023-11-15');

-- Insert sample projects
INSERT INTO projects (name, description, project_type, status, priority, start_date, end_date, estimated_hours, project_manager_id, created_by) VALUES
('E-commerce Website Redesign', 'Complete redesign of company e-commerce platform', 'development', 'active', 'high', '2024-02-01', '2024-04-30', 320, 3, 1),
('Mobile App Development', 'Native mobile app for iOS and Android', 'development', 'planning', 'medium', '2024-03-15', '2024-08-15', 480, 3, 1),
('Marketing Campaign Automation', 'Automated email marketing system', 'marketing', 'active', 'medium', '2024-01-15', '2024-03-15', 160, 3, 1);

-- Link projects with required skills
INSERT INTO project_skills (project_id, skill_id, required_level, is_mandatory) VALUES
(1, 2, 3, true),  -- E-commerce project needs React level 3
(1, 10, 3, true), -- E-commerce project needs UI/UX level 3
(1, 1, 3, true),  -- E-commerce project needs JavaScript level 3
(2, 2, 4, true),  -- Mobile app needs React level 4
(2, 1, 4, true),  -- Mobile app needs JavaScript level 4
(3, 6, 3, true),  -- Marketing automation needs PM level 3
(3, 7, 3, false); -- Marketing automation prefers Communication level 3

-- Insert project assignments
INSERT INTO project_assignments (user_id, project_id, role, hours_allocated, hourly_rate, status) VALUES
(2, 1, 'Frontend Developer', 120, 45.00, 'active'),
(4, 1, 'UI/UX Designer', 80, 50.00, 'active'),
(3, 1, 'Tech Lead', 60, 65.00, 'active'),
(5, 3, 'Project Coordinator', 40, 35.00, 'active');

-- Insert sample badges
INSERT INTO badges (name, description, badge_type, token_reward, rarity) VALUES
('First Course Complete', 'Complete your first training course', 'course', 100, 'common'),
('JavaScript Master', 'Demonstrate advanced JavaScript skills', 'skill', 250, 'uncommon'),
('Project Hero', 'Successfully complete a high-priority project', 'project', 300, 'rare'),
('Team Player', 'Receive excellent teamwork ratings', 'performance', 150, 'common'),
('Leadership Excellence', 'Show outstanding leadership qualities', 'performance', 400, 'epic');

-- Award some badges to users
INSERT INTO user_badges (user_id, badge_id, awarded_by, notes) VALUES
(2, 1, 1, 'Completed React Fundamentals course'),
(3, 2, 1, 'Demonstrated expert JavaScript knowledge'),
(3, 5, 1, 'Excellent leadership on multiple projects'),
(4, 1, 1, 'Completed UI/UX Design Principles'),
(5, 4, 1, 'Great collaboration on marketing project');

-- Initialize token balances for users
INSERT INTO user_tokens (user_id, balance, lifetime_earned) VALUES
(2, 100, 100),
(3, 650, 650),
(4, 100, 100),
(5, 150, 150);

-- Insert token transactions
INSERT INTO token_transactions (user_id, transaction_type, amount, source, description, balance_after) VALUES
(2, 'earned', 100, 'badge_earned', 'First Course Complete badge', 100),
(3, 'earned', 250, 'badge_earned', 'JavaScript Master badge', 250),
(3, 'earned', 400, 'badge_earned', 'Leadership Excellence badge', 650),
(4, 'earned', 100, 'badge_earned', 'First Course Complete badge', 100),
(5, 'earned', 150, 'badge_earned', 'Team Player badge', 150);

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
(2, 'New Course Available', 'Advanced JavaScript Concepts course is now available', 'course', false),
(2, 'Project Assignment', 'You have been assigned to E-commerce Website Redesign', 'project', true),
(3, 'Badge Earned', 'Congratulations! You earned the Leadership Excellence badge', 'badge', false),
(4, 'Course Reminder', 'Continue your UI/UX Design Principles course', 'course', false),
(5, 'Performance Review', 'Your quarterly performance review is due', 'system', false);

-- Insert app settings
INSERT INTO app_settings (setting_key, setting_value, description) VALUES
('token_exchange_rate', '0.01', 'USD value per token'),
('max_concurrent_courses', '3', 'Maximum courses a user can enroll in simultaneously'),
('performance_review_frequency', '90', 'Days between performance reviews'),
('badge_notification_enabled', 'true', 'Send notifications when badges are earned'),
('project_auto_assignment', 'false', 'Automatically assign users to projects based on skills');

-- Additional Course and Enrollment Seed Data for Week 2

-- Insert more comprehensive course data
INSERT INTO courses (title, description, category, difficulty_level, duration_hours, instructor_name, instructor_bio, learning_objectives, prerequisites, price, created_by, is_active) VALUES

-- Programming Courses
('Full Stack Web Development', 'Complete course covering frontend and backend development with modern frameworks', 'Programming', 'intermediate', 40, 'Sarah Chen', 'Senior Full Stack Developer with 8 years experience', ARRAY['Build complete web applications', 'Master React and Node.js', 'Understand database design', 'Deploy applications to cloud'], 'Basic JavaScript knowledge', 299.99, 1, true),

('Python for Data Science', 'Learn Python programming specifically for data analysis and machine learning', 'Data Science', 'beginner', 35, 'Dr. Michael Rodriguez', 'PhD in Computer Science, Data Science consultant', ARRAY['Master Python fundamentals', 'Work with pandas and numpy', 'Create data visualizations', 'Build basic ML models'], 'Basic programming experience helpful', 249.99, 1, true),

('Mobile App Development with React Native', 'Build cross-platform mobile applications using React Native', 'Mobile Development', 'intermediate', 30, 'Jennifer Park', 'Mobile app developer, published 15+ apps', ARRAY['Create iOS and Android apps', 'Handle device APIs', 'Implement navigation', 'Deploy to app stores'], 'React knowledge required', 199.99, 1, true),

-- Design Courses
('UI/UX Design Fundamentals', 'Master the principles of user interface and user experience design', 'Design', 'beginner', 25, 'Alex Thompson', 'Lead UX Designer at tech startup', ARRAY['Understand design principles', 'Create wireframes and mockups', 'Conduct user research', 'Design accessible interfaces'], 'None', 179.99, 1, true),

('Advanced Figma Techniques', 'Professional Figma skills for complex design systems', 'Design', 'advanced', 20, 'Maria Silva', 'Senior Product Designer, Figma Community Leader', ARRAY['Master Figma components', 'Build design systems', 'Create interactive prototypes', 'Collaborate effectively'], 'Basic Figma knowledge', 149.99, 1, true),

-- Business Courses
('Digital Marketing Strategy', 'Comprehensive digital marketing course covering all major channels', 'Marketing', 'intermediate', 28, 'David Kim', 'Digital Marketing Director, 10+ years experience', ARRAY['Develop marketing strategies', 'Master social media marketing', 'Understand SEO and SEM', 'Analyze marketing metrics'], 'Basic marketing knowledge', 229.99, 1, true),

('Project Management Professional', 'Prepare for PMP certification and master project management', 'Management', 'intermediate', 45, 'Lisa Johnson', 'PMP Certified, Senior Project Manager', ARRAY['Master PM methodologies', 'Use PM tools effectively', 'Manage stakeholders', 'Prepare for PMP exam'], 'Some project experience', 349.99, 1, true),

-- Technical Skills
('Cloud Computing with AWS', 'Learn Amazon Web Services from basics to advanced concepts', 'Cloud Computing', 'intermediate', 35, 'Robert Wilson', 'AWS Solutions Architect, Cloud Consultant', ARRAY['Understand cloud fundamentals', 'Deploy applications on AWS', 'Implement security best practices', 'Optimize costs'], 'Basic IT knowledge', 279.99, 1, true),

('DevOps Fundamentals', 'Introduction to DevOps practices and tools', 'DevOps', 'beginner', 30, 'Amanda Foster', 'DevOps Engineer, Infrastructure Specialist', ARRAY['Understand CI/CD pipelines', 'Master containerization', 'Learn infrastructure as code', 'Implement monitoring'], 'Basic programming knowledge', 199.99, 1, true),

-- Free Courses
('Introduction to Programming', 'Start your programming journey with this beginner-friendly course', 'Programming', 'beginner', 20, 'Tom Bradley', 'Computer Science Teacher', ARRAY['Learn programming basics', 'Understand algorithms', 'Write your first programs', 'Problem-solving skills'], 'None', 0.00, 1, true),

('Time Management for Professionals', 'Improve productivity and work-life balance', 'Productivity', 'beginner', 8, 'Emily Watson', 'Productivity Coach and Author', ARRAY['Master time management', 'Reduce stress and overwhelm', 'Increase productivity', 'Better work-life balance'], 'None', 0.00, 1, true);

-- Link courses with skills they teach (extending existing course_skills)
INSERT INTO course_skills (course_id, skill_id, skill_level) VALUES
-- Full Stack Web Development teaches multiple skills
(6, 1, 4), -- JavaScript (advanced level)
(6, 2, 4), -- React (advanced level)
(6, 3, 3), -- Node.js (intermediate level)

-- Python for Data Science
(7, 4, 3), -- Python (intermediate level)

-- Mobile App Development
(8, 1, 3), -- JavaScript
(8, 2, 3), -- React

-- UI/UX Design course
(9, 10, 3), -- UI/UX Design

-- Advanced Figma
(10, 10, 4), -- UI/UX Design (advanced)

-- Digital Marketing
(11, 7, 3), -- Communication

-- Project Management
(12, 6, 4), -- Project Management (advanced)
(12, 8, 3), -- Leadership

-- DevOps and Programming basics
(14, 1, 2), -- JavaScript (beginner level)
(15, 1, 1); -- JavaScript (basic level)

-- Create some sample enrollments for testing
INSERT INTO course_enrollments (user_id, course_id, status, progress_percentage, enrollment_date, start_date) VALUES
-- User 2 (John Doe) enrollments
(2, 6, 'in_progress', 45, '2024-01-15', '2024-01-16'),
(2, 7, 'enrolled', 0, '2024-02-01', NULL),
(2, 15, 'completed', 100, '2023-12-01', '2023-12-02'),

-- User 3 (Jane Smith) enrollments  
(3, 9, 'completed', 100, '2023-11-15', '2023-11-16'),
(3, 12, 'in_progress', 75, '2024-01-10', '2024-01-11'),
(3, 6, 'in_progress', 60, '2024-01-20', '2024-01-21'),

-- User 4 (Bob Wilson) enrollments
(4, 9, 'in_progress', 30, '2024-01-25', '2024-01-26'),
(4, 10, 'enrolled', 0, '2024-02-05', NULL),
(4, 11, 'completed', 100, '2023-12-10', '2023-12-11'),

-- User 5 (Alice Brown) enrollments
(5, 11, 'in_progress', 80, '2024-01-18', '2024-01-19'),
(5, 12, 'enrolled', 0, '2024-02-03', NULL),
(5, 14, 'completed', 100, '2023-12-20', '2023-12-21');

-- Update completion dates for completed courses
UPDATE course_enrollments 
SET completion_date = '2023-12-15' 
WHERE status = 'completed' AND user_id = 2 AND course_id = 15;

UPDATE course_enrollments 
SET completion_date = '2023-12-01' 
WHERE status = 'completed' AND user_id = 3 AND course_id = 9;

UPDATE course_enrollments 
SET completion_date = '2024-01-15' 
WHERE status = 'completed' AND user_id = 4 AND course_id = 11;

UPDATE course_enrollments 
SET completion_date = '2024-01-25' 
WHERE status = 'completed' AND user_id = 5 AND course_id = 14;

-- Set start dates for in_progress courses
UPDATE course_enrollments 
SET start_date = '2024-01-16' 
WHERE status = 'in_progress' AND user_id = 2 AND course_id = 6;

UPDATE course_enrollments 
SET start_date = '2024-01-11' 
WHERE status = 'in_progress' AND user_id = 3 AND course_id = 12;

UPDATE course_enrollments 
SET start_date = '2024-01-21' 
WHERE status = 'in_progress' AND user_id = 3 AND course_id = 6;

UPDATE course_enrollments 
SET start_date = '2024-01-26' 
WHERE status = 'in_progress' AND user_id = 4 AND course_id = 9;

UPDATE course_enrollments 
SET start_date = '2024-01-19' 
WHERE status = 'in_progress' AND user_id = 5 AND course_id = 11;
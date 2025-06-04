const bcrypt = require('bcrypt');
const { 
  User, Skill, UserSkill, Badge, UserBadge, UserToken, TokenTransaction,
  Notification, PerformanceReview, Payment, Course, CourseEnrollment,
  CourseSkill, Project, ProjectAssignment, ProjectSkill, AppSetting
} = require('./models');

async function seedDatabase() {
  try {    console.log('Starting database seeding...');

    // Clear existing data to avoid conflicts (delete in correct order to handle foreign keys)
    console.log('Clearing existing data...');
    await Promise.all([
      TokenTransaction.destroy({ where: {} }),
      Notification.destroy({ where: {} }),
      PerformanceReview.destroy({ where: {} }),
      Payment.destroy({ where: {} }),
      CourseEnrollment.destroy({ where: {} }),
      CourseSkill.destroy({ where: {} }),
      ProjectAssignment.destroy({ where: {} }),
      ProjectSkill.destroy({ where: {} }),
      UserSkill.destroy({ where: {} }),
      UserBadge.destroy({ where: {} }),
      UserToken.destroy({ where: {} })
    ]);
    
    // Delete main entity tables
    await Promise.all([
      Course.destroy({ where: {} }),
      Project.destroy({ where: {} }),
      Badge.destroy({ where: {} }),
      Skill.destroy({ where: {} }),
      AppSetting.destroy({ where: {} })
    ]);
    
    // Delete users last
    await User.destroy({ where: {} });

    // 1. Create App Settings
    const appSettings = await AppSetting.bulkCreate([
      {
        setting_key: 'SYSTEM_NAME',
        setting_value: 'CompanyGrow Pro',
        description: 'Name of the learning management system'
      },
      {
        setting_key: 'TOKEN_REWARD_COURSE_COMPLETION',
        setting_value: '100',
        description: 'Tokens awarded for completing a course'
      },
      {
        setting_key: 'TOKEN_REWARD_PROJECT_COMPLETION',
        setting_value: '150',
        description: 'Tokens awarded for completing a project'
      },
      {
        setting_key: 'TOKEN_REWARD_BADGE_EARNED',
        setting_value: '50',
        description: 'Tokens awarded for earning a badge'
      },
      {
        setting_key: 'MAX_COURSE_ENROLLMENTS',
        setting_value: '5',
        description: 'Maximum concurrent course enrollments per user'
      }
    ]);

    // 2. Create Users
    const hashedPassword = await bcrypt.hash('password123', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);
    const users = await User.bulkCreate([
      {
        email: 'admin@companygrow.com',
        password: adminPassword,
        first_name: 'Admin',
        last_name: 'Smith',
        role: 'admin',
        department: 'IT',
        position: 'CTO',
        hire_date: new Date('2020-01-15'),
        phone: '+1-555-0101',
        bio: 'Experienced technology leader with 15+ years in software development and team management.'
      },
      {
        email: 'sarah.johnson@company.com',
        password: hashedPassword,
        first_name: 'Sarah',
        last_name: 'Johnson',
        role: 'manager',
        department: 'Engineering',
        position: 'Senior Engineering Manager',
        hire_date: new Date('2021-03-10'),
        phone: '+1-555-0102',
        bio: 'Full-stack developer turned manager, passionate about building high-performing teams.'
      },
      {
        email: 'john.doe@companygrow.com',
        password: hashedPassword,
        first_name: 'John',
        last_name: 'Doe',
        role: 'employee',
        department: 'Engineering',
        position: 'Senior Frontend Developer',
        hire_date: new Date('2022-01-20'),
        phone: '+1-555-0103',
        bio: 'React specialist with expertise in modern frontend architectures.'
      },
      {
        email: 'lisa.garcia@company.com',
        password: hashedPassword,
        first_name: 'Lisa',
        last_name: 'Garcia',
        role: 'employee',
        department: 'Engineering',
        position: 'Backend Developer',
        hire_date: new Date('2022-05-15'),
        phone: '+1-555-0104',
        bio: 'Python and Node.js developer with strong database design skills.'
      },
      {
        email: 'david.wilson@company.com',
        password: hashedPassword,
        first_name: 'David',
        last_name: 'Wilson',
        role: 'employee',
        department: 'Engineering',
        position: 'DevOps Engineer',
        hire_date: new Date('2021-11-01'),
        phone: '+1-555-0105',
        bio: 'Cloud infrastructure and automation specialist.'
      },
      {
        email: 'emily.brown@company.com',
        password: hashedPassword,
        first_name: 'Emily',
        last_name: 'Brown',
        role: 'employee',
        department: 'Design',
        position: 'UX Designer',
        hire_date: new Date('2023-02-14'),
        phone: '+1-555-0106',
        bio: 'User experience designer focused on creating intuitive digital experiences.'
      },
      {
        email: 'alex.taylor@company.com',
        password: hashedPassword,
        first_name: 'Alex',
        last_name: 'Taylor',
        role: 'employee',
        department: 'Engineering',
        position: 'Junior Developer',
        hire_date: new Date('2023-08-01'),
        phone: '+1-555-0107',
        bio: 'Recent computer science graduate eager to learn and contribute.'
      },
      {
        email: 'maria.rodriguez@company.com',
        password: hashedPassword,
        first_name: 'Maria',
        last_name: 'Rodriguez',
        role: 'employee',
        department: 'Data',
        position: 'Data Scientist',
        hire_date: new Date('2022-09-12'),
        phone: '+1-555-0108',
        bio: 'Machine learning expert with background in statistical analysis.'
      },
      {
        email: 'james.anderson@company.com',
        password: hashedPassword,
        first_name: 'James',
        last_name: 'Anderson',
        role: 'manager',
        department: 'Product',
        position: 'Product Manager',
        hire_date: new Date('2021-07-05'),
        phone: '+1-555-0109',
        bio: 'Product strategy and roadmap planning specialist.'
      },
      {
        email: 'jennifer.lee@company.com',
        password: hashedPassword,
        first_name: 'Jennifer',
        last_name: 'Lee',
        role: 'employee',
        department: 'QA',
        position: 'QA Engineer',
        hire_date: new Date('2022-12-01'),
        phone: '+1-555-0110',
        bio: 'Quality assurance engineer with expertise in automated testing.'
      }
    ]);

    // 3. Create Skills
    const skills = await Skill.bulkCreate([
      { name: 'JavaScript', category: 'Programming', description: 'Modern JavaScript development including ES6+' },
      { name: 'React', category: 'Frontend', description: 'React.js library for building user interfaces' },
      { name: 'Node.js', category: 'Backend', description: 'Server-side JavaScript runtime' },
      { name: 'Python', category: 'Programming', description: 'General-purpose programming language' },
      { name: 'SQL', category: 'Database', description: 'Structured Query Language for database management' },
      { name: 'AWS', category: 'Cloud', description: 'Amazon Web Services cloud platform' },
      { name: 'Docker', category: 'DevOps', description: 'Containerization platform' },
      { name: 'Git', category: 'Version Control', description: 'Distributed version control system' },
      { name: 'Machine Learning', category: 'AI/ML', description: 'Machine learning algorithms and techniques' },
      { name: 'UX Design', category: 'Design', description: 'User experience design principles' },
      { name: 'Agile Methodology', category: 'Management', description: 'Agile project management practices' },
      { name: 'TypeScript', category: 'Programming', description: 'Typed superset of JavaScript' },
      { name: 'Vue.js', category: 'Frontend', description: 'Progressive JavaScript framework' },
      { name: 'PostgreSQL', category: 'Database', description: 'Advanced open-source relational database' },
      { name: 'Kubernetes', category: 'DevOps', description: 'Container orchestration platform' },
      { name: 'GraphQL', category: 'API', description: 'Query language for APIs' },
      { name: 'Redux', category: 'Frontend', description: 'Predictable state container for JavaScript apps' },
      { name: 'MongoDB', category: 'Database', description: 'NoSQL document database' },
      { name: 'CI/CD', category: 'DevOps', description: 'Continuous Integration and Continuous Deployment' },
      { name: 'Team Leadership', category: 'Management', description: 'Leading and managing development teams' }
    ]);    // 4. Create User Skills
    const userSkills = await UserSkill.bulkCreate([
      // Admin Smith (CTO) - Advanced in most areas
      { user_id: users[0].id, skill_id: skills[0].id, proficiency_level: 5, years_experience: 12, is_verified: true },
      { user_id: users[0].id, skill_id: skills[2].id, proficiency_level: 5, years_experience: 10, is_verified: true },
      { user_id: users[0].id, skill_id: skills[10].id, proficiency_level: 5, years_experience: 15, is_verified: true },
      { user_id: users[0].id, skill_id: skills[19].id, proficiency_level: 5, years_experience: 8, is_verified: true },
      
      // Sarah Johnson (Manager) - Strong technical background
      { user_id: users[1].id, skill_id: skills[0].id, proficiency_level: 4, years_experience: 8, is_verified: true },
      { user_id: users[1].id, skill_id: skills[1].id, proficiency_level: 4, years_experience: 6, is_verified: true },
      { user_id: users[1].id, skill_id: skills[10].id, proficiency_level: 5, years_experience: 5, is_verified: true },
      { user_id: users[1].id, skill_id: skills[19].id, proficiency_level: 4, years_experience: 4, is_verified: true },

      // John Doe (Frontend Developer)
      { user_id: users[2].id, skill_id: skills[0].id, proficiency_level: 5, years_experience: 7, is_verified: true },
      { user_id: users[2].id, skill_id: skills[1].id, proficiency_level: 5, years_experience: 6, is_verified: true },
      { user_id: users[2].id, skill_id: skills[11].id, proficiency_level: 4, years_experience: 4, is_verified: true },
      { user_id: users[2].id, skill_id: skills[16].id, proficiency_level: 4, years_experience: 5, is_verified: true },
      
      // Lisa Garcia (Backend Developer)
      { user_id: users[3].id, skill_id: skills[2].id, proficiency_level: 5, years_experience: 5, is_verified: true },
      { user_id: users[3].id, skill_id: skills[3].id, proficiency_level: 4, years_experience: 4, is_verified: true },
      { user_id: users[3].id, skill_id: skills[4].id, proficiency_level: 5, years_experience: 6, is_verified: true },
      { user_id: users[3].id, skill_id: skills[13].id, proficiency_level: 4, years_experience: 3, is_verified: true },
      
      // David Wilson (DevOps)
      { user_id: users[4].id, skill_id: skills[5].id, proficiency_level: 5, years_experience: 4, is_verified: true },
      { user_id: users[4].id, skill_id: skills[6].id, proficiency_level: 5, years_experience: 5, is_verified: true },
      { user_id: users[4].id, skill_id: skills[14].id, proficiency_level: 4, years_experience: 3, is_verified: true },
      { user_id: users[4].id, skill_id: skills[18].id, proficiency_level: 5, years_experience: 4, is_verified: true },
      
      // Emily Brown (UX Designer)
      { user_id: users[5].id, skill_id: skills[9].id, proficiency_level: 5, years_experience: 4, is_verified: true },
      { user_id: users[5].id, skill_id: skills[0].id, proficiency_level: 3, years_experience: 2, is_verified: false },
      { user_id: users[5].id, skill_id: skills[1].id, proficiency_level: 2, years_experience: 1, is_verified: false },
      
      // Alex Taylor (Junior Developer)
      { user_id: users[6].id, skill_id: skills[0].id, proficiency_level: 3, years_experience: 1, is_verified: false },
      { user_id: users[6].id, skill_id: skills[1].id, proficiency_level: 2, years_experience: 1, is_verified: false },
      { user_id: users[6].id, skill_id: skills[7].id, proficiency_level: 3, years_experience: 2, is_verified: true },
      
      // Maria Rodriguez (Data Scientist)
      { user_id: users[7].id, skill_id: skills[3].id, proficiency_level: 5, years_experience: 6, is_verified: true },
      { user_id: users[7].id, skill_id: skills[8].id, proficiency_level: 5, years_experience: 4, is_verified: true },
      { user_id: users[7].id, skill_id: skills[4].id, proficiency_level: 4, years_experience: 5, is_verified: true },
      
      // James Anderson (Product Manager)
      { user_id: users[8].id, skill_id: skills[10].id, proficiency_level: 5, years_experience: 6, is_verified: true },
      { user_id: users[8].id, skill_id: skills[19].id, proficiency_level: 4, years_experience: 4, is_verified: true },
      
      // Jennifer Lee (QA Engineer)
      { user_id: users[9].id, skill_id: skills[0].id, proficiency_level: 3, years_experience: 3, is_verified: true },
      { user_id: users[9].id, skill_id: skills[18].id, proficiency_level: 4, years_experience: 2, is_verified: true },
      { user_id: users[9].id, skill_id: skills[7].id, proficiency_level: 4, years_experience: 4, is_verified: true }
    ]);

    // 5. Create Badges
    const badges = await Badge.bulkCreate([
      {
        name: 'Code Master',
        description: 'Achieved mastery in multiple programming languages',
        badge_type: 'skill',
        criteria: 'Proficiency level 8+ in 3 or more programming skills',
        token_reward: 200,
        rarity: 'rare'
      },
      {
        name: 'Team Player',
        description: 'Excellent collaboration and teamwork',
        badge_type: 'social',
        criteria: 'Positive feedback from 5+ team members',
        token_reward: 100,
        rarity: 'common'
      },
      {
        name: 'Learning Enthusiast',
        description: 'Completed 5 or more courses',
        badge_type: 'learning',
        criteria: 'Complete 5 courses with 80%+ score',
        token_reward: 150,
        rarity: 'uncommon'
      },
      {
        name: 'Innovation Leader',
        description: 'Led successful innovative projects',
        badge_type: 'leadership',
        criteria: 'Successfully managed 3+ projects with high ratings',
        token_reward: 300,
        rarity: 'epic'
      },
      {
        name: 'Quick Learner',
        description: 'Rapidly acquired new skills',
        badge_type: 'learning',
        criteria: 'Gained proficiency in new skill within 30 days',
        token_reward: 75,
        rarity: 'common'
      },
      {
        name: 'Mentor',
        description: 'Helped others grow and develop',
        badge_type: 'social',
        criteria: 'Mentored junior team members',
        token_reward: 125,
        rarity: 'uncommon'
      },
      {
        name: 'Full-Stack Hero',
        description: 'Proficient in both frontend and backend technologies',
        badge_type: 'skill',
        criteria: 'Level 7+ in both frontend and backend skills',
        token_reward: 250,
        rarity: 'rare'
      },
      {
        name: 'Cloud Expert',
        description: 'Master of cloud technologies',
        badge_type: 'skill',
        criteria: 'Advanced proficiency in cloud platforms',
        token_reward: 175,
        rarity: 'uncommon'
      }
    ]);

    // 6. Create User Badges
    const userBadges = await UserBadge.bulkCreate([
      { user_id: users[0].id, badge_id: badges[0].id, awarded_by: users[0].id, notes: 'Exceptional programming skills across multiple languages' },
      { user_id: users[0].id, badge_id: badges[3].id, awarded_by: users[0].id, notes: 'Outstanding leadership in technical initiatives' },
      { user_id: users[1].id, badge_id: badges[1].id, awarded_by: users[0].id, notes: 'Excellent team collaboration and support' },
      { user_id: users[1].id, badge_id: badges[5].id, awarded_by: users[0].id, notes: 'Great mentor to junior developers' },
      { user_id: users[2].id, badge_id: badges[6].id, awarded_by: users[1].id, notes: 'Strong full-stack development capabilities' },
      { user_id: users[2].id, badge_id: badges[2].id, awarded_by: users[1].id, notes: 'Completed multiple advanced courses' },
      { user_id: users[4].id, badge_id: badges[7].id, awarded_by: users[0].id, notes: 'Expert-level cloud infrastructure management' },
      { user_id: users[6].id, badge_id: badges[4].id, awarded_by: users[1].id, notes: 'Quickly mastered React fundamentals' },
      { user_id: users[7].id, badge_id: badges[0].id, awarded_by: users[0].id, notes: 'Advanced Python and ML programming skills' }
    ]);

    // 7. Create User Tokens
    const userTokens = await UserToken.bulkCreate([
      { user_id: users[0].id, balance: 850, lifetime_earned: 1200, lifetime_spent: 350 },
      { user_id: users[1].id, balance: 675, lifetime_earned: 925, lifetime_spent: 250 },
      { user_id: users[2].id, balance: 425, lifetime_earned: 650, lifetime_spent: 225 },
      { user_id: users[3].id, balance: 320, lifetime_earned: 480, lifetime_spent: 160 },
      { user_id: users[4].id, balance: 495, lifetime_earned: 645, lifetime_spent: 150 },
      { user_id: users[5].id, balance: 240, lifetime_earned: 340, lifetime_spent: 100 },
      { user_id: users[6].id, balance: 175, lifetime_earned: 250, lifetime_spent: 75 },
      { user_id: users[7].id, balance: 380, lifetime_earned: 520, lifetime_spent: 140 },
      { user_id: users[8].id, balance: 290, lifetime_earned: 390, lifetime_spent: 100 },
      { user_id: users[9].id, balance: 155, lifetime_earned: 225, lifetime_spent: 70 }
    ]);

    // 8. Create Courses
    const courses = await Course.bulkCreate([
      {
        title: 'Advanced React Development',
        description: 'Master advanced React patterns, hooks, and performance optimization techniques.',
        category: 'Frontend',
        difficulty_level: 'advanced',
        duration_hours: 40,
        instructor_name: 'Sarah Johnson',
        instructor_bio: 'Senior Engineering Manager with 8+ years of React experience',
        course_materials: ['Video lectures', 'Hands-on projects', 'Code templates', 'Quiz assessments'],
        prerequisites: 'Basic React knowledge required',
        learning_objectives: ['Master React hooks', 'Implement performance optimizations', 'Build complex applications'],
        price: 299.99,
        created_by: users[1].id
      },
      {
        title: 'Node.js Backend Mastery',
        description: 'Build scalable backend applications with Node.js, Express, and modern best practices.',
        category: 'Backend',
        difficulty_level: 'intermediate',
        duration_hours: 35,
        instructor_name: 'Lisa Garcia',
        instructor_bio: 'Backend specialist with expertise in Node.js and database design',
        course_materials: ['Video tutorials', 'Project assignments', 'API documentation examples'],
        prerequisites: 'JavaScript fundamentals',
        learning_objectives: ['Build REST APIs', 'Database integration', 'Authentication systems'],
        price: 249.99,
        created_by: users[3].id
      },
      {
        title: 'Cloud Infrastructure with AWS',
        description: 'Learn to design and deploy cloud infrastructure using Amazon Web Services.',
        category: 'Cloud',
        difficulty_level: 'intermediate',
        duration_hours: 45,
        instructor_name: 'David Wilson',
        instructor_bio: 'DevOps engineer specializing in cloud architecture and automation',
        course_materials: ['AWS labs', 'Architecture diagrams', 'Best practice guides'],
        prerequisites: 'Basic understanding of networking and servers',
        learning_objectives: ['Deploy applications on AWS', 'Manage cloud resources', 'Implement security best practices'],
        price: 349.99,
        created_by: users[4].id
      },
      {
        title: 'UX Design Fundamentals',
        description: 'Learn the principles of user experience design and create intuitive interfaces.',
        category: 'Design',
        difficulty_level: 'beginner',
        duration_hours: 25,
        instructor_name: 'Emily Brown',
        instructor_bio: 'UX Designer focused on creating user-centered digital experiences',
        course_materials: ['Design tools tutorials', 'Case studies', 'Design templates'],
        prerequisites: 'No prior experience required',
        learning_objectives: ['Understand UX principles', 'Create user personas', 'Design wireframes and prototypes'],
        price: 199.99,
        created_by: users[5].id
      },
      {
        title: 'Machine Learning with Python',
        description: 'Introduction to machine learning algorithms and implementation in Python.',
        category: 'AI/ML',
        difficulty_level: 'intermediate',
        duration_hours: 50,
        instructor_name: 'Maria Rodriguez',
        instructor_bio: 'Data scientist with expertise in ML algorithms and statistical analysis',
        course_materials: ['Jupyter notebooks', 'Dataset collections', 'Algorithm implementations'],
        prerequisites: 'Python programming experience',
        learning_objectives: ['Implement ML algorithms', 'Data preprocessing', 'Model evaluation'],
        price: 399.99,
        created_by: users[7].id
      },
      {
        title: 'Modern JavaScript ES6+',
        description: 'Master modern JavaScript features and best practices for contemporary development.',
        category: 'Programming',
        difficulty_level: 'beginner',
        duration_hours: 30,
        instructor_name: 'John Doe',
        instructor_bio: 'Senior frontend developer with extensive JavaScript expertise',
        course_materials: ['Code examples', 'Interactive exercises', 'Browser compatibility guides'],
        prerequisites: 'Basic programming knowledge helpful but not required',
        learning_objectives: ['ES6+ syntax mastery', 'Async programming', 'Module systems'],
        price: 179.99,
        created_by: users[2].id
      }
    ]);    // 9. Create Course Skills relationships
    const courseSkills = await CourseSkill.bulkCreate([
      // Advanced React Development
      { course_id: courses[0].id, skill_id: skills[0].id, skill_level: 4 }, // JavaScript
      { course_id: courses[0].id, skill_id: skills[1].id, skill_level: 5 }, // React
      { course_id: courses[0].id, skill_id: skills[16].id, skill_level: 4 }, // Redux
      
      // Node.js Backend Mastery
      { course_id: courses[1].id, skill_id: skills[0].id, skill_level: 4 }, // JavaScript
      { course_id: courses[1].id, skill_id: skills[2].id, skill_level: 4 }, // Node.js
      { course_id: courses[1].id, skill_id: skills[4].id, skill_level: 3 }, // SQL
      
      // Cloud Infrastructure with AWS
      { course_id: courses[2].id, skill_id: skills[5].id, skill_level: 4 }, // AWS
      { course_id: courses[2].id, skill_id: skills[6].id, skill_level: 4 }, // Docker
      { course_id: courses[2].id, skill_id: skills[18].id, skill_level: 4 }, // CI/CD
      
      // UX Design Fundamentals
      { course_id: courses[3].id, skill_id: skills[9].id, skill_level: 3 }, // UX Design
      
      // Machine Learning with Python
      { course_id: courses[4].id, skill_id: skills[3].id, skill_level: 4 }, // Python
      { course_id: courses[4].id, skill_id: skills[8].id, skill_level: 5 }, // Machine Learning
      
      // Modern JavaScript ES6+
      { course_id: courses[5].id, skill_id: skills[0].id, skill_level: 3 } // JavaScript
    ]);

    // 10. Create Course Enrollments
    const courseEnrollments = await CourseEnrollment.bulkCreate([
      // Current enrollments
      {
        user_id: users[6].id, // Alex (Junior Dev)
        course_id: courses[0].id, // Advanced React
        enrollment_date: new Date('2024-11-01'),
        start_date: new Date('2024-11-01'),
        progress_percentage: 65,
        status: 'in_progress'
      },
      {
        user_id: users[6].id,
        course_id: courses[5].id, // Modern JavaScript
        enrollment_date: new Date('2024-10-15'),
        start_date: new Date('2024-10-15'),
        completion_date: new Date('2024-11-30'),
        progress_percentage: 100,
        status: 'completed',
        final_score: 87
      },
      {
        user_id: users[5].id, // Emily (UX Designer)
        course_id: courses[5].id, // Modern JavaScript
        enrollment_date: new Date('2024-11-10'),
        start_date: new Date('2024-11-10'),
        progress_percentage: 30,
        status: 'in_progress'
      },
      {
        user_id: users[9].id, // Jennifer (QA)
        course_id: courses[2].id, // AWS Cloud
        enrollment_date: new Date('2024-10-01'),
        start_date: new Date('2024-10-01'),
        progress_percentage: 45,
        status: 'in_progress'
      },
      // Completed courses
      {
        user_id: users[2].id, // Mike
        course_id: courses[1].id, // Node.js Backend
        enrollment_date: new Date('2024-08-01'),
        start_date: new Date('2024-08-01'),
        completion_date: new Date('2024-09-15'),
        progress_percentage: 100,
        status: 'completed',
        final_score: 92
      },
      {
        user_id: users[3].id, // Lisa
        course_id: courses[4].id, // Machine Learning
        enrollment_date: new Date('2024-07-01'),
        start_date: new Date('2024-07-01'),
        completion_date: new Date('2024-08-30'),
        progress_percentage: 100,
        status: 'completed',
        final_score: 89
      }
    ]);    // 11. Create Projects
    const projects = await Project.bulkCreate([
      {
        name: 'Customer Portal Redesign',
        description: 'Complete redesign of the customer self-service portal with modern UI/UX',
        project_type: 'Web Development',
        status: 'active',
        priority: 'high',
        start_date: new Date('2024-10-01'),
        end_date: new Date('2025-01-31'),
        estimated_hours: 800,
        actual_hours: 320,
        budget: 75000.00,
        client_name: 'Internal',
        project_manager_id: users[1].id, // Sarah Johnson
        created_by: users[0].id // Admin Smith
      },
      {
        name: 'Mobile App Development',
        description: 'Native mobile application for iOS and Android platforms',
        project_type: 'Mobile Development',
        status: 'planning',
        priority: 'medium',
        start_date: new Date('2025-02-01'),
        end_date: new Date('2025-06-30'),
        estimated_hours: 1200,
        actual_hours: 0,
        budget: 120000.00,
        client_name: 'ABC Corporation',
        project_manager_id: users[8].id, // James Anderson
        created_by: users[0].id
      },
      {
        name: 'Data Analytics Platform',
        description: 'Machine learning-powered analytics dashboard for business intelligence',
        project_type: 'Data Science',
        status: 'completed',
        priority: 'high',
        start_date: new Date('2024-05-01'),
        end_date: new Date('2024-09-30'),
        estimated_hours: 600,
        actual_hours: 620,
        budget: 90000.00,
        client_name: 'XYZ Analytics',
        project_manager_id: users[7].id, // Maria Rodriguez
        created_by: users[0].id
      },
      {
        name: 'API Gateway Implementation',
        description: 'Implement microservices API gateway with authentication and rate limiting',
        project_type: 'Backend Development',
        status: 'active',
        priority: 'medium',
        start_date: new Date('2024-11-01'),
        end_date: new Date('2025-02-28'),
        estimated_hours: 400,
        actual_hours: 120,
        budget: 45000.00,
        client_name: 'TechCorp',
        project_manager_id: users[1].id,
        created_by: users[0].id
      }
    ]);    // 12. Create Project Assignments
    const projectAssignments = await ProjectAssignment.bulkCreate([
      // Customer Portal Redesign
      {
        user_id: users[2].id, // Mike (Frontend)
        project_id: projects[0].id,
        role: 'Frontend Developer',
        assigned_hours: 200,
        hourly_rate: 75.00,
        assignment_date: new Date('2024-10-01'),
        status: 'active'
      },
      {
        user_id: users[5].id, // Emily (UX Designer)
        project_id: projects[0].id,
        role: 'UX Designer',
        assigned_hours: 150,
        hourly_rate: 70.00,
        assignment_date: new Date('2024-10-01'),
        status: 'active'
      },
      {
        user_id: users[3].id, // Lisa (Backend)
        project_id: projects[0].id,
        role: 'Backend Developer',
        assigned_hours: 180,
        hourly_rate: 80.00,
        assignment_date: new Date('2024-10-05'),
        status: 'active'
      },
      // Mobile App Development
      {
        user_id: users[2].id, // Mike
        project_id: projects[1].id,
        role: 'Mobile Developer',
        assigned_hours: 300,
        hourly_rate: 75.00,
        assignment_date: new Date('2025-02-01'),
        status: 'active'
      },
      {
        user_id: users[6].id, // Alex
        project_id: projects[1].id,
        role: 'Junior Developer',
        assigned_hours: 200,
        hourly_rate: 45.00,
        assignment_date: new Date('2025-02-01'),
        status: 'active'
      },
      // Data Analytics Platform (Completed)
      {
        user_id: users[7].id, // Maria
        project_id: projects[2].id,
        role: 'Data Scientist',
        assigned_hours: 300,
        hourly_rate: 90.00,
        assignment_date: new Date('2024-05-01'),
        completion_date: new Date('2024-09-30'),
        status: 'completed'
      },
      {
        user_id: users[3].id, // Lisa
        project_id: projects[2].id,
        role: 'Backend Developer',
        assigned_hours: 200,
        hourly_rate: 80.00,
        assignment_date: new Date('2024-05-15'),
        completion_date: new Date('2024-09-30'),
        status: 'completed'
      },
      // API Gateway Implementation
      {
        user_id: users[3].id, // Lisa
        project_id: projects[3].id,
        role: 'Lead Backend Developer',
        assigned_hours: 250,
        hourly_rate: 85.00,
        assignment_date: new Date('2024-11-01'),
        status: 'active'
      },
      {
        user_id: users[4].id, // David (DevOps)
        project_id: projects[3].id,
        role: 'DevOps Engineer',
        assigned_hours: 100,
        hourly_rate: 85.00,
        assignment_date: new Date('2024-11-15'),
        status: 'active'
      }
    ]);// 13. Create Project Skills
    const projectSkills = await ProjectSkill.bulkCreate([
      // Customer Portal Redesign
      { project_id: projects[0].id, skill_id: skills[1].id, required_level: 4 }, // React
      { project_id: projects[0].id, skill_id: skills[0].id, required_level: 4 }, // JavaScript
      { project_id: projects[0].id, skill_id: skills[9].id, required_level: 4 }, // UX Design
      { project_id: projects[0].id, skill_id: skills[2].id, required_level: 3 }, // Node.js
      
      // Mobile App Development
      { project_id: projects[1].id, skill_id: skills[0].id, required_level: 4 }, // JavaScript
      { project_id: projects[1].id, skill_id: skills[1].id, required_level: 4 }, // React
      { project_id: projects[1].id, skill_id: skills[9].id, required_level: 4 }, // UX Design
      
      // Data Analytics Platform
      { project_id: projects[2].id, skill_id: skills[3].id, required_level: 5 }, // Python
      { project_id: projects[2].id, skill_id: skills[8].id, required_level: 4 }, // Machine Learning
      { project_id: projects[2].id, skill_id: skills[4].id, required_level: 4 }, // SQL
      
      // API Gateway Implementation
      { project_id: projects[3].id, skill_id: skills[2].id, required_level: 4 }, // Node.js
      { project_id: projects[3].id, skill_id: skills[5].id, required_level: 4 }, // AWS
      { project_id: projects[3].id, skill_id: skills[6].id, required_level: 3 }, // Docker
      { project_id: projects[3].id, skill_id: skills[18].id, required_level: 4 } // CI/CD
    ]);

    // 14. Create Token Transactions
    const tokenTransactions = await TokenTransaction.bulkCreate([
      // Course completion rewards
      {
        user_id: users[6].id, // Alex
        transaction_type: 'earned',
        amount: 100,
        source_type: 'course_completion',
        source_id: courseEnrollments[1].id,
        description: 'Completed Modern JavaScript ES6+ course'
      },
      {
        user_id: users[2].id, // Mike
        transaction_type: 'earned',
        amount: 100,
        source_type: 'course_completion',
        source_id: courseEnrollments[4].id,
        description: 'Completed Node.js Backend Mastery course'
      },
      {
        user_id: users[3].id, // Lisa
        transaction_type: 'earned',
        amount: 100,
        source_type: 'course_completion',
        source_id: courseEnrollments[5].id,
        description: 'Completed Machine Learning with Python course'
      },
      // Badge rewards
      {
        user_id: users[0].id, // Admin Smith
        transaction_type: 'earned',
        amount: 200,
        source_type: 'badge_earned',
        source_id: userBadges[0].id,
        description: 'Earned Code Master badge'
      },
      {
        user_id: users[2].id, // John Doe
        transaction_type: 'earned',
        amount: 250,
        source_type: 'badge_earned',
        source_id: userBadges[4].id,
        description: 'Earned Full-Stack Hero badge'
      },
      // Project completion rewards
      {
        user_id: users[7].id, // Maria
        transaction_type: 'earned',
        amount: 150,
        source_type: 'project_completion',
        source_id: projects[2].id,
        description: 'Completed Data Analytics Platform project'
      },
      // Token spending
      {
        user_id: users[1].id, // Sarah
        transaction_type: 'spent',
        amount: 50,
        source_type: 'reward_purchase',
        description: 'Purchased company merchandise'
      },
      {
        user_id: users[2].id, // John Doe
        transaction_type: 'spent',
        amount: 100,
        source_type: 'training_materials',
        description: 'Purchased additional course materials'
      }
    ]);

    // 15. Create Notifications
    const notifications = await Notification.bulkCreate([
      {
        user_id: users[6].id, // Alex
        title: 'Course Completed!',
        message: 'Congratulations! You have successfully completed the Modern JavaScript ES6+ course with a score of 87%.',
        notification_type: 'achievement',
        is_read: false,
        priority: 'medium'
      },
      {
        user_id: users[6].id, // Alex
        title: 'New Badge Earned',
        message: 'You earned the "Quick Learner" badge for rapidly mastering React fundamentals!',
        notification_type: 'badge',
        is_read: true,
        priority: 'high'
      },
      {
        user_id: users[2].id, // John Doe
        title: 'Project Assignment',
        message: 'You have been assigned to the Customer Portal Redesign project as Frontend Developer.',
        notification_type: 'project',
        is_read: true,
        priority: 'high'
      },
      {
        user_id: users[5].id, // Emily
        title: 'Course Enrollment',
        message: 'You have been enrolled in the Modern JavaScript ES6+ course. Start learning today!',
        notification_type: 'course',
        is_read: false,
        priority: 'medium'
      },
      {
        user_id: users[9].id, // Jennifer
        title: 'Skill Verification',
        message: 'Your Git skill has been verified by your manager. Great work!',
        notification_type: 'skill',
        is_read: false,
        priority: 'low'
      },
      {
        user_id: users[3].id, // Lisa
        title: 'Performance Review Scheduled',
        message: 'Your quarterly performance review has been scheduled for next week.',
        notification_type: 'review',
        is_read: false,
        priority: 'high'
      }
    ]);    // 16. Create Performance Reviews
    const performanceReviews = await PerformanceReview.bulkCreate([
      {
        employee_id: users[2].id, // John Doe
        reviewer_id: users[1].id, // Sarah (Manager)
        review_period_start: new Date('2024-07-01'),
        review_period_end: new Date('2024-09-30'),
        overall_rating: 4.5,
        technical_skills_rating: 4.8,
        communication_rating: 4.2,
        teamwork_rating: 4.6,
        leadership_rating: 3.8,
        goals_achievement_rating: 4.4,
        strengths: 'Excellent React development skills, proactive problem solving, mentors junior developers well',
        areas_for_improvement: 'Could improve backend knowledge, public speaking skills',
        goals_next_period: 'Complete Node.js certification, lead a major frontend initiative',
        reviewer_comments: 'Mike consistently delivers high-quality work and is becoming a key technical contributor.',
        employee_comments: 'Grateful for the learning opportunities. Looking forward to expanding backend skills.',
        status: 'approved'
      },
      {
        employee_id: users[6].id, // Alex
        reviewer_id: users[1].id, // Sarah (Manager)
        review_period_start: new Date('2024-08-01'),
        review_period_end: new Date('2024-10-31'),
        overall_rating: 3.8,
        technical_skills_rating: 3.5,
        communication_rating: 4.2,
        teamwork_rating: 4.0,
        leadership_rating: 3.0,
        goals_achievement_rating: 4.0,
        strengths: 'Quick learner, good team collaboration, eager to take on new challenges',
        areas_for_improvement: 'Code review skills, complex problem solving, technical documentation',
        goals_next_period: 'Complete React advanced course, contribute to major project features',
        reviewer_comments: 'Alex shows great potential and is progressing well as a junior developer.',
        employee_comments: 'Excited about the React course and upcoming project work.',
        status: 'approved'
      },
      {
        employee_id: users[3].id, // Lisa
        reviewer_id: users[1].id, // Sarah (Manager)
        review_period_start: new Date('2024-10-01'),
        review_period_end: new Date('2024-12-31'),
        overall_rating: 4.7,
        technical_skills_rating: 4.9,
        communication_rating: 4.4,
        teamwork_rating: 4.8,
        leadership_rating: 4.2,
        goals_achievement_rating: 4.6,
        strengths: 'Outstanding backend development skills, excellent database design, great mentor',
        areas_for_improvement: 'Frontend technologies, presentation skills',
        goals_next_period: 'Learn React basics, present at tech talks, lead API design discussions',
        reviewer_comments: 'Lisa is one of our strongest backend developers and a valuable team member.',
        employee_comments: 'Appreciate the feedback. Looking forward to expanding my frontend knowledge.',
        status: 'submitted'
      }
    ]);

    // 17. Create Payments
    const payments = await Payment.bulkCreate([
      {
        user_id: users[6].id, // Alex
        amount: 179.99,
        payment_type: 'course_fee',
        payment_method: 'credit_card',
        payment_status: 'completed',
        transaction_id: 'txn_001_js_course',
        description: 'Payment for Modern JavaScript ES6+ course',
        course_id: courses[5].id
      },
      {
        user_id: users[5].id, // Emily
        amount: 179.99,
        payment_type: 'course_fee',
        payment_method: 'paypal',
        payment_status: 'completed',
        transaction_id: 'txn_002_js_course',
        description: 'Payment for Modern JavaScript ES6+ course',
        course_id: courses[5].id
      },
      {
        user_id: users[9].id, // Jennifer
        amount: 349.99,
        payment_type: 'course_fee',
        payment_method: 'bank_transfer',
        payment_status: 'completed',
        transaction_id: 'txn_003_aws_course',
        description: 'Payment for Cloud Infrastructure with AWS course',
        course_id: courses[2].id
      },
      {
        user_id: users[2].id, // Mike
        amount: 249.99,
        payment_type: 'course_fee',
        payment_method: 'credit_card',
        payment_status: 'completed',
        transaction_id: 'txn_004_nodejs_course',
        description: 'Payment for Node.js Backend Mastery course',
        course_id: courses[1].id
      },
      {
        user_id: users[3].id, // Lisa
        amount: 399.99,
        payment_type: 'course_fee',
        payment_method: 'company_budget',
        payment_status: 'completed',
        transaction_id: 'txn_005_ml_course',
        description: 'Payment for Machine Learning with Python course',
        course_id: courses[4].id
      }
    ]);

    console.log('✅ Database seeding completed successfully!');
    console.log(`Created ${users.length} users`);
    console.log(`Created ${skills.length} skills`);
    console.log(`Created ${courses.length} courses`);
    console.log(`Created ${projects.length} projects`);
    console.log(`Created ${badges.length} badges`);
    console.log(`Created ${notifications.length} notifications`);
    console.log(`Created ${performanceReviews.length} performance reviews`);
    console.log(`Created ${payments.length} payments`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Database seeding failed:', err);
    process.exit(1);
  }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

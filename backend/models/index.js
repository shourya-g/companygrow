const User = require('./user');
const Skill = require('./skill');
const UserSkill = require('./userSkill');
const Badge = require('./badge');
const UserBadge = require('./userBadge');
const UserToken = require('./userToken');
const TokenTransaction = require('./tokenTransaction');
const Notification = require('./notification');
const PerformanceReview = require('./performanceReview');
const Payment = require('./payment');
const Course = require('./course');
const CourseEnrollment = require('./courseEnrollment');
const CourseSkill = require('./courseSkill');
const Project = require('./project');
const ProjectAssignment = require('./projectAssignment');
const ProjectSkill = require('./projectSkill');
const AppSetting = require('./appSetting');

// User Associations
User.hasMany(CourseEnrollment, { foreignKey: 'user_id' });
User.hasMany(Course, { foreignKey: 'created_by', as: 'createdCourses' });
User.hasMany(Project, { foreignKey: 'project_manager_id', as: 'managedProjects' });
User.hasMany(Project, { foreignKey: 'created_by', as: 'createdProjects' });
User.hasMany(ProjectAssignment, { foreignKey: 'user_id' });
User.hasMany(Payment, { foreignKey: 'user_id' });
User.hasMany(TokenTransaction, { foreignKey: 'user_id' });
User.hasMany(Notification, { foreignKey: 'user_id' });
User.hasMany(PerformanceReview, { foreignKey: 'employee_id', as: 'employeeReviews' });
User.hasMany(PerformanceReview, { foreignKey: 'reviewer_id', as: 'reviewerReviews' });
User.hasOne(UserToken, { foreignKey: 'user_id' });
User.belongsToMany(Skill, { through: UserSkill, foreignKey: 'user_id', otherKey: 'skill_id' });
User.belongsToMany(Badge, { through: UserBadge, foreignKey: 'user_id', otherKey: 'badge_id' });

// Skill Associations
Skill.hasMany(UserSkill, { foreignKey: 'skill_id' });
Skill.hasMany(CourseSkill, { foreignKey: 'skill_id' });
Skill.hasMany(ProjectSkill, { foreignKey: 'skill_id' });
Skill.belongsToMany(User, { through: UserSkill, foreignKey: 'skill_id', otherKey: 'user_id' });
Skill.belongsToMany(Course, { through: CourseSkill, foreignKey: 'skill_id', otherKey: 'course_id' });
Skill.belongsToMany(Project, { through: ProjectSkill, foreignKey: 'skill_id', otherKey: 'project_id' });

// Course Associations
Course.hasMany(CourseEnrollment, { foreignKey: 'course_id' });
Course.hasMany(CourseSkill, { foreignKey: 'course_id' });
Course.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Course.belongsToMany(Skill, { through: CourseSkill, foreignKey: 'course_id', otherKey: 'skill_id' });
Course.belongsToMany(User, { through: CourseEnrollment, foreignKey: 'course_id', otherKey: 'user_id' });

// Project Associations
Project.hasMany(ProjectAssignment, { foreignKey: 'project_id' });
Project.hasMany(ProjectSkill, { foreignKey: 'project_id' });
Project.belongsTo(User, { foreignKey: 'project_manager_id', as: 'manager' });
Project.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Project.belongsToMany(Skill, { through: ProjectSkill, foreignKey: 'project_id', otherKey: 'skill_id' });
Project.belongsToMany(User, { through: ProjectAssignment, foreignKey: 'project_id', otherKey: 'user_id' });

// Badge Associations
Badge.hasMany(UserBadge, { foreignKey: 'badge_id' });
Badge.belongsToMany(User, { through: UserBadge, foreignKey: 'badge_id', otherKey: 'user_id' });

// CourseEnrollment Associations
CourseEnrollment.belongsTo(User, { foreignKey: 'user_id' });
CourseEnrollment.belongsTo(Course, { foreignKey: 'course_id' });

// ProjectAssignment Associations
ProjectAssignment.belongsTo(User, { foreignKey: 'user_id' });
ProjectAssignment.belongsTo(Project, { foreignKey: 'project_id' });

// PerformanceReview Associations
PerformanceReview.belongsTo(User, { foreignKey: 'employee_id', as: 'employee' });
PerformanceReview.belongsTo(User, { foreignKey: 'reviewer_id', as: 'reviewer' });

// Payment Associations
Payment.belongsTo(User, { foreignKey: 'user_id' });

// TokenTransaction Associations
TokenTransaction.belongsTo(User, { foreignKey: 'user_id' });

// UserToken Associations
UserToken.belongsTo(User, { foreignKey: 'user_id' });

// Notification Associations
Notification.belongsTo(User, { foreignKey: 'user_id' });

// Pivot Table Associations
UserSkill.belongsTo(User, { foreignKey: 'user_id' });
UserSkill.belongsTo(Skill, { foreignKey: 'skill_id' });
CourseSkill.belongsTo(Course, { foreignKey: 'course_id' });
CourseSkill.belongsTo(Skill, { foreignKey: 'skill_id' });
ProjectSkill.belongsTo(Project, { foreignKey: 'project_id' });
ProjectSkill.belongsTo(Skill, { foreignKey: 'skill_id' });
UserBadge.belongsTo(User, { foreignKey: 'user_id' });
UserBadge.belongsTo(Badge, { foreignKey: 'badge_id' });
UserBadge.belongsTo(User, { foreignKey: 'awarded_by', as: 'awarder' });

// AppSetting: no associations

module.exports = {
  User,
  Skill,
  UserSkill,
  Badge,
  UserBadge,
  UserToken,
  TokenTransaction,
  Notification,
  PerformanceReview,
  Payment,
  Course,
  CourseEnrollment,
  CourseSkill,
  Project,
  ProjectAssignment,
  ProjectSkill,
  AppSetting
};

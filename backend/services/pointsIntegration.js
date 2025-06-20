const LeaderboardService = require('./leaderboardService');

class PointsIntegration {
  
  // User registration welcome bonus
  static async onUserRegistered(userId) {
    try {
      await LeaderboardService.awardPoints(
        userId,
        'registration_bonus',
        50,
        null,
        'registration',
        'Welcome bonus for joining CompanyGrow!'
      );
    } catch (error) {
      console.error('Error awarding registration points:', error);
    }
  }

  // Course enrollment points
  static async onCourseEnrolled(userId, courseId) {
    try {
      await LeaderboardService.awardPoints(
        userId,
        'course_enrollment',
        25,
        courseId,
        'course',
        'Enrolled in a new course'
      );
    } catch (error) {
      console.error('Error awarding course enrollment points:', error);
    }
  }

  // Course started points
  static async onCourseStarted(userId, courseId) {
    try {
      await LeaderboardService.awardPoints(
        userId,
        'course_started',
        25,
        courseId,
        'course',
        'Started learning a course'
      );
    } catch (error) {
      console.error('Error awarding course start points:', error);
    }
  }

  // Course progress milestone points
  static async onCourseProgressMilestone(userId, courseId, percentage) {
    try {
      const points = percentage === 25 ? 25 : percentage === 50 ? 50 : percentage === 75 ? 75 : 0;
      if (points > 0) {
        await LeaderboardService.awardPoints(
          userId,
          'course_progress',
          points,
          courseId,
          'course',
          `Reached ${percentage}% progress in course`
        );
      }
    } catch (error) {
      console.error('Error awarding course progress points:', error);
    }
  }

  // Course completion points
  static async onCourseCompleted(userId, courseId) {
    try {
      await LeaderboardService.awardPoints(
        userId,
        'course_completion',
        150,
        courseId,
        'course',
        'Course completed successfully'
      );
    } catch (error) {
      console.error('Error awarding course completion points:', error);
    }
  }

  // Project assignment points
  static async onProjectAssigned(userId, projectId) {
    try {
      await LeaderboardService.awardPoints(
        userId,
        'project_assignment',
        50,
        projectId,
        'project',
        'Assigned to a new project'
      );
    } catch (error) {
      console.error('Error awarding project assignment points:', error);
    }
  }

  // Project completion points
  static async onProjectCompleted(userId, projectId) {
    try {
      await LeaderboardService.awardPoints(
        userId,
        'project_completion',
        200,
        projectId,
        'project',
        'Project completed successfully'
      );
    } catch (error) {
      console.error('Error awarding project completion points:', error);
    }
  }

  // Badge earned points
  static async onBadgeEarned(userId, badgeId) {
    try {
      await LeaderboardService.awardPoints(
        userId,
        'badge_earned',
        75,
        badgeId,
        'badge',
        'Badge earned'
      );
    } catch (error) {
      console.error('Error awarding badge points:', error);
    }
  }

  // Skill verification points
  static async onSkillVerified(userId, skillId) {
    try {
      await LeaderboardService.awardPoints(
        userId,
        'skill_verified',
        30,
        skillId,
        'skill',
        'Skill verified by manager'
      );
    } catch (error) {
      console.error('Error awarding skill verification points:', error);
    }
  }

  // Profile completion points
  static async onProfileUpdated(userId) {
    try {
      await LeaderboardService.awardPoints(
        userId,
        'profile_update',
        20,
        null,
        'profile',
        'Profile information updated'
      );
    } catch (error) {
      console.error('Error awarding profile update points:', error);
    }
  }

  // Login streak bonus
  static async onDailyLogin(userId) {
    try {
      await LeaderboardService.awardPoints(
        userId,
        'daily_activity',
        10,
        null,
        'activity',
        'Daily login activity'
      );
    } catch (error) {
      console.error('Error awarding daily activity points:', error);
    }
  }

  // Peer review points
  static async onPeerReviewCompleted(userId, revieweeId) {
    try {
      await LeaderboardService.awardPoints(
        userId,
        'peer_review',
        40,
        revieweeId,
        'review',
        'Completed peer review'
      );
    } catch (error) {
      console.error('Error awarding peer review points:', error);
    }
  }

  // Mentoring points
  static async onMentoringSession(userId, menteeId) {
    try {
      await LeaderboardService.awardPoints(
        userId,
        'mentoring',
        60,
        menteeId,
        'mentoring',
        'Conducted mentoring session'
      );
    } catch (error) {
        console.error('Error awarding mentoring points:', error);
      }
    }
   
    // Knowledge sharing points (e.g., creating helpful content)
    static async onKnowledgeSharing(userId, contentType, contentId) {
      try {
        const pointsMap = {
          'blog_post': 80,
          'tutorial': 100,
          'documentation': 60,
          'presentation': 70,
          'workshop': 120
        };
        
        const points = pointsMap[contentType] || 50;
        
        await LeaderboardService.awardPoints(
          userId,
          'knowledge_sharing',
          points,
          contentId,
          contentType,
          `Created ${contentType} for knowledge sharing`
        );
      } catch (error) {
        console.error('Error awarding knowledge sharing points:', error);
      }
    }
   
    // Team collaboration points
    static async onTeamCollaboration(userId, collaborationType, relatedId) {
      try {
        const pointsMap = {
          'code_review': 25,
          'pair_programming': 40,
          'team_meeting': 15,
          'brainstorming': 30,
          'problem_solving': 35
        };
        
        const points = pointsMap[collaborationType] || 20;
        
        await LeaderboardService.awardPoints(
          userId,
          'team_collaboration',
          points,
          relatedId,
          'collaboration',
          `Participated in ${collaborationType.replace('_', ' ')}`
        );
      } catch (error) {
        console.error('Error awarding collaboration points:', error);
      }
    }
   
    // Innovation/idea submission points
    static async onIdeaSubmission(userId, ideaId) {
      try {
        await LeaderboardService.awardPoints(
          userId,
          'idea_submission',
          50,
          ideaId,
          'innovation',
          'Submitted innovative idea'
        );
      } catch (error) {
        console.error('Error awarding idea submission points:', error);
      }
    }
   
    // Community participation points
    static async onCommunityParticipation(userId, activityType, activityId) {
      try {
        const pointsMap = {
          'forum_post': 10,
          'helpful_answer': 25,
          'question_asked': 15,
          'event_attendance': 30,
          'volunteer_work': 50
        };
        
        const points = pointsMap[activityType] || 15;
        
        await LeaderboardService.awardPoints(
          userId,
          'community_participation',
          points,
          activityId,
          'community',
          `Participated in ${activityType.replace('_', ' ')}`
        );
      } catch (error) {
        console.error('Error awarding community participation points:', error);
      }
    }
   
    // Continuous learning bonus (multiple activities in a week)
    static async checkWeeklyLearningBonus(userId) {
      try {
        // This would check if user has done multiple learning activities this week
        // and award a bonus - implementation depends on your specific requirements
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);
   
        const { LeaderboardPoint } = require('../models');
        const weeklyActivities = await LeaderboardPoint.count({
          where: {
            user_id: userId,
            points_type: {
              [require('sequelize').Op.in]: ['course_completion', 'project_completion', 'skill_verified']
            },
            created_at: {
              [require('sequelize').Op.gte]: weekStart
            }
          }
        });
   
        // Award bonus for completing 3+ learning activities in a week
        if (weeklyActivities >= 3) {
          await LeaderboardService.awardPoints(
            userId,
            'weekly_learning_bonus',
            100,
            null,
            'bonus',
            `Weekly learning streak bonus (${weeklyActivities} activities)`
          );
        }
      } catch (error) {
        console.error('Error checking weekly learning bonus:', error);
      }
    }
   
    // Leadership points for managers
    static async onLeadershipActivity(userId, activityType, teamSize = 1) {
      try {
        const basePoints = {
          'team_management': 40,
          'performance_review': 30,
          'goal_setting': 25,
          'conflict_resolution': 50,
          'strategic_planning': 60
        };
        
        const points = (basePoints[activityType] || 30) + (teamSize * 5);
        
        await LeaderboardService.awardPoints(
          userId,
          'leadership_activity',
          points,
          null,
          'leadership',
          `Leadership activity: ${activityType.replace('_', ' ')}`
        );
      } catch (error) {
        console.error('Error awarding leadership points:', error);
      }
    }
   
    // Special event participation
    static async onEventParticipation(userId, eventType, eventId) {
      try {
        const pointsMap = {
          'hackathon': 150,
          'conference': 100,
          'workshop': 75,
          'webinar': 40,
          'company_event': 50,
          'training_session': 60
        };
        
        const points = pointsMap[eventType] || 50;
        
        await LeaderboardService.awardPoints(
          userId,
          'event_participation',
          points,
          eventId,
          'event',
          `Participated in ${eventType.replace('_', ' ')}`
        );
      } catch (error) {
        console.error('Error awarding event participation points:', error);
      }
    }
   
   // Add these methods to the existing PointsIntegration class

    // Skill addition points
    static async onSkillAdded(userId, skillId, proficiencyLevel) {
        try {
        const basePoints = 20;
        const proficiencyBonus = proficiencyLevel * 5; // Extra points for higher initial proficiency
        const totalPoints = basePoints + proficiencyBonus;
        
        await LeaderboardService.awardPoints(
            userId,
            'skill_added',
            totalPoints,
            skillId,
            'skill',
            `Added new skill (Level ${proficiencyLevel})`
        );
        } catch (error) {
        console.error('Error awarding skill addition points:', error);
        }
    }
    
    // Skill improvement points
    static async onSkillImproved(userId, skillId, improvement) {
        try {
        const points = improvement * 15; // 15 points per level improvement
        
        await LeaderboardService.awardPoints(
            userId,
            'skill_improvement',
            points,
            skillId,
            'skill',
            `Improved skill by ${improvement} level${improvement > 1 ? 's' : ''}`
        );
        } catch (error) {
        console.error('Error awarding skill improvement points:', error);
        }
    }
    
    // Skill mastery bonus (reaching level 5)
    static async onSkillMastery(userId, skillId) {
        try {
        await LeaderboardService.awardPoints(
            userId,
            'skill_mastery',
            100,
            skillId,
            'skill',
            'Achieved skill mastery (Level 5)'
        );
        } catch (error) {
        console.error('Error awarding skill mastery points:', error);
        }
    }
    
    // Skill removal points (optional - deduct points)
    static async onSkillRemoved(userId, skillId) {
        try {
        await LeaderboardService.awardPoints(
            userId,
            'skill_removed',
            -10, // Negative points for removing skills
            skillId,
            'skill',
            'Skill removed from profile'
        );
        } catch (error) {
        console.error('Error deducting skill removal points:', error);
        }
    }}
    module.exports = PointsIntegration;
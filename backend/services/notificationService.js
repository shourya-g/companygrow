// backend/services/notificationService.js
const { Notification, User } = require('../models');
const { Op } = require('sequelize');

class NotificationService {
  // Create a notification
  static async createNotification(userId, title, message, type, actionUrl = null) {
    try {
      const notification = await Notification.create({
        user_id: userId,
        title,
        message,
        type,
        action_url: actionUrl,
        is_read: false
      });

      // If you have WebSocket support, emit the notification
      if (global.io) {
        global.io.to(`user_${userId}`).emit('notification', {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          action_url: notification.action_url,
          created_at: notification.created_at
        });
      }

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Create bulk notifications
  static async createBulkNotifications(userIds, title, message, type, actionUrl = null) {
    try {
      const notifications = await Notification.bulkCreate(
        userIds.map(userId => ({
          user_id: userId,
          title,
          message,
          type,
          action_url: actionUrl,
          is_read: false
        }))
      );

      // Emit to all users if WebSocket is available
      if (global.io) {
        userIds.forEach(userId => {
          global.io.to(`user_${userId}`).emit('notification', {
            title,
            message,
            type,
            action_url: actionUrl,
            created_at: new Date()
          });
        });
      }

      return notifications;
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      throw error;
    }
  }

  // Notification triggers for various events
  static async notifyCourseEnrollment(userId, courseName) {
    return this.createNotification(
      userId,
      'Course Enrollment Successful',
      `You have been successfully enrolled in "${courseName}"`,
      'course',
      '/courses'
    );
  }

  static async notifyCourseCompletion(userId, courseName, badgeEarned = null) {
    let message = `Congratulations! You have completed "${courseName}"`;
    if (badgeEarned) {
      message += ` and earned the "${badgeEarned}" badge!`;
    }
    
    return this.createNotification(
      userId,
      'Course Completed',
      message,
      'course',
      '/profile'
    );
  }

  static async notifyProjectAssignment(userId, projectName, role) {
    return this.createNotification(
      userId,
      'New Project Assignment',
      `You have been assigned to "${projectName}" as ${role}`,
      'project',
      '/projects'
    );
  }

  static async notifySkillVerification(userId, skillName) {
    return this.createNotification(
      userId,
      'Skill Verified',
      `Your "${skillName}" skill has been verified by your manager`,
      'skill',
      '/profile'
    );
  }

  static async notifyBadgeEarned(userId, badgeName, tokenReward) {
    return this.createNotification(
      userId,
      'Badge Earned!',
      `Congratulations! You earned the "${badgeName}" badge and ${tokenReward} tokens`,
      'badge',
      '/rewards'
    );
  }

  static async notifyPerformanceReview(userId, status) {
    const messages = {
      'submitted': 'Your performance review has been submitted for approval',
      'approved': 'Your performance review has been approved',
      'requires_action': 'You have a pending performance review to complete'
    };
    
    return this.createNotification(
      userId,
      'Performance Review Update',
      messages[status] || 'Your performance review status has been updated',
      'review',
      '/performance'
    );
  }

  static async notifyTokenTransaction(userId, amount, type, reason) {
    const message = type === 'earned' 
      ? `You earned ${amount} tokens for ${reason}`
      : `You spent ${amount} tokens on ${reason}`;
    
    return this.createNotification(
      userId,
      'Token Transaction',
      message,
      'token',
      '/rewards'
    );
  }

  static async notifyPaymentProcessed(userId, amount, status) {
    const message = status === 'succeeded'
      ? `Your payment of ${amount} has been processed successfully`
      : `Your payment of ${amount} failed to process`;
    
    return this.createNotification(
      userId,
      'Payment Update',
      message,
      'payment',
      '/payments'
    );
  }

  static async notifySkillGap(userId, skillName, projectName) {
    return this.createNotification(
      userId,
      'Skill Development Opportunity',
      `Develop your "${skillName}" skill to qualify for "${projectName}" project`,
      'skill',
      '/courses'
    );
  }

  static async notifyDeadlineApproaching(userId, itemType, itemName, daysLeft) {
    return this.createNotification(
      userId,
      `${itemType} Deadline Approaching`,
      `"${itemName}" is due in ${daysLeft} days`,
      'deadline',
      itemType === 'Project' ? '/projects' : '/courses'
    );
  }

  // Get unread notifications for a user
  static async getUnreadNotifications(userId) {
    try {
      const notifications = await Notification.findAll({
        where: {
          user_id: userId,
          is_read: false
        },
        order: [['created_at', 'DESC']],
        limit: 10
      });
      
      return notifications;
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        where: {
          id: notificationId,
          user_id: userId
        }
      });
      
      if (!notification) {
        throw new Error('Notification not found');
      }
      
      await notification.update({ is_read: true });
      
      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId) {
    try {
      const result = await Notification.update(
        { is_read: true },
        {
          where: {
            user_id: userId,
            is_read: false
          }
        }
      );
      
      return result;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Delete old notifications (cleanup)
  static async cleanupOldNotifications(daysToKeep = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      const result = await Notification.destroy({
        where: {
          created_at: {
            [Op.lt]: cutoffDate
          },
          is_read: true
        }
      });
      
      console.log(`Deleted ${result} old notifications`);
      return result;
    } catch (error) {
      console.error('Error cleaning up notifications:', error);
      throw error;
    }
  }

  // Schedule notification for future
  static async scheduleNotification(userId, title, message, type, scheduledFor, actionUrl = null) {
    // This would integrate with a job queue like Bull or node-cron
    // For now, we'll create it immediately with a scheduled_for field
    try {
      const notification = await Notification.create({
        user_id: userId,
        title,
        message,
        type,
        action_url: actionUrl,
        is_read: false,
        scheduled_for: scheduledFor
      });
      
      return notification;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;
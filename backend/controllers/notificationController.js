const { Notification } = require('../models');

module.exports = {
  async getAllNotifications(req, res) {
    const notifications = await Notification.findAll();
    res.json({ success: true, data: notifications });
  },
  async getNotificationById(req, res) {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) return res.status(404).json({ success: false, error: { message: 'Notification not found' } });
    res.json({ success: true, data: notification });
  },
  // ...other notification controller methods (create, update, delete, mark as read, etc.)
};

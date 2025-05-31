const { AppSetting } = require('../models');

module.exports = {
  async getAllSettings(req, res) {
    const settings = await AppSetting.findAll();
    res.json({ success: true, data: settings });
  },
  async getSettingByKey(req, res) {
    const setting = await AppSetting.findOne({ where: { setting_key: req.params.key } });
    if (!setting) return res.status(404).json({ success: false, error: { message: 'Setting not found' } });
    res.json({ success: true, data: setting });
  },
  // ...other app setting controller methods (create, update, delete, etc.)
};

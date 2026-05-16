const { Announcement } = require('../models');

exports.createAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.create(req.body);
    res.status(201).json(announcement);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getGlobalAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.findAll({
      where: { isGlobal: true },
      order: [['createdAt', 'DESC']],
      limit: 5
    });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

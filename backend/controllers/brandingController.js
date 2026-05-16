const { ClinicBranding } = require('../models');

exports.getBranding = async (req, res) => {
  try {
    const branding = await ClinicBranding.findOne();
    res.json(branding || {});
  } catch (error) {
    res.status(500).json({ message: 'Error fetching branding' });
  }
};

exports.updateBranding = async (req, res) => {
  try {
    const { slug, clinicName, logo, bio, fee, photos, mapsLink, whatsappNumber, socialLink } = req.body;
    let branding = await ClinicBranding.findOne();
    
    const updateData = { 
      slug, clinicName, logo, bio, fee, 
      photos: JSON.stringify(photos),
      mapsLink, whatsappNumber, socialLink 
    };

    if (branding) {
      await branding.update(updateData);
    } else {
      branding = await ClinicBranding.create(updateData);
    }
    res.status(200).json(branding);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error saving branding' });
  }
};

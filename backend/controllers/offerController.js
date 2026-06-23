const Offer = require('../models/Offer');

const createOffer = async (req, res) => {
  try {
    const { label, title, description, discountPercent } = req.body;
    const vendorId = req.user.userId;

    if (!label || !title || !description || discountPercent === undefined) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    if (discountPercent < 1 || discountPercent > 100) {
      return res.status(400).json({ success: false, message: 'Discount percent must be between 1 and 100.' });
    }

    const newOffer = new Offer({
      vendorId,
      label: String(label).trim(),
      title: String(title).trim(),
      description: String(description).trim(),
      discountPercent: parseInt(discountPercent),
    });

    await newOffer.save();

    return res.status(201).json({
      success: true,
      message: 'Offer created successfully.',
      offer: newOffer,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create offer.', error: error.message });
  }
};

const getVendorOffers = async (req, res) => {
  try {
    const vendorId = req.user.userId;

    const offers = await Offer.find({ vendorId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      offers,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch offers.', error: error.message });
  }
};

const getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find({ isActive: true })
      .select('_id label title description discountPercent')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      offers,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch offers.', error: error.message });
  }
};

const updateOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.user.userId;
    const { label, title, description, discountPercent } = req.body;

    const offer = await Offer.findOne({ _id: id, vendorId });

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found.' });
    }

    if (label !== undefined) offer.label = String(label).trim();
    if (title !== undefined) offer.title = String(title).trim();
    if (description !== undefined) offer.description = String(description).trim();
    if (discountPercent !== undefined) {
      if (discountPercent < 1 || discountPercent > 100) {
        return res.status(400).json({ success: false, message: 'Discount percent must be between 1 and 100.' });
      }
      offer.discountPercent = parseInt(discountPercent);
    }

    await offer.save();

    return res.status(200).json({
      success: true,
      message: 'Offer updated successfully.',
      offer,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update offer.', error: error.message });
  }
};

const deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.user.userId;

    const offer = await Offer.findOneAndDelete({ _id: id, vendorId });

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Offer deleted successfully.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete offer.', error: error.message });
  }
};

module.exports = {
  createOffer,
  getVendorOffers,
  getAllOffers,
  updateOffer,
  deleteOffer,
};

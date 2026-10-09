const User = require('../models/User');

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ userId: req.user.userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
        details: [],
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        userId: user.userId,
        role: user.role,
        name: user.name,
        email: user.email,
        city: user.city,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, city } = req.body;
    const user = await User.findOne({ userId: req.user.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
        details: [],
      });
    }

    if (name !== undefined) user.name = name;
    if (city !== undefined) user.city = city;

    await user.save();

    return res.status(200).json({
      success: true,
      data: {
        userId: user.userId,
        role: user.role,
        name: user.name,
        email: user.email,
        city: user.city,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
};

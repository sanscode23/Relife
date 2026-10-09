const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateUserId } = require('../services/idService');
const { signToken } = require('../middleware/auth');

const guestAuth = async (req, res, next) => {
  try {
    const userId = generateUserId();
    const guestUser = await User.create({
      userId,
      role: 'GUEST',
      name: 'Guest User',
    });

    const token = signToken({ userId: guestUser.userId, role: guestUser.role });

    return res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          userId: guestUser.userId,
          role: guestUser.role,
          name: guestUser.name,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, city } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.',
        details: [],
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = generateUserId();

    const user = await User.create({
      userId,
      role: 'USER',
      name,
      email: email.toLowerCase(),
      passwordHash,
      city: city || '',
    });

    const token = signToken({ userId: user.userId, role: user.role });

    return res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          userId: user.userId,
          role: user.role,
          name: user.name,
          email: user.email,
          city: user.city,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.passwordHash) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        details: [],
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        details: [],
      });
    }

    const token = signToken({ userId: user.userId, role: user.role });

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          userId: user.userId,
          role: user.role,
          name: user.name,
          email: user.email,
          city: user.city,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const upgradeGuest = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const currentUserId = req.user.userId;

    const existingEmail = await User.findOne({ email: email.toLowerCase(), userId: { $ne: currentUserId } });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'Email address is already in use by another registered user.',
        details: [],
      });
    }

    const user = await User.findOne({ userId: currentUserId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
        details: [],
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    user.name = name;
    user.email = email.toLowerCase();
    user.passwordHash = passwordHash;
    user.role = 'USER';
    await user.save();

    const token = signToken({ userId: user.userId, role: user.role });

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          userId: user.userId,
          role: user.role,
          name: user.name,
          email: user.email,
          city: user.city,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findOne({ userId: req.user.userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
        details: [],
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          userId: user.userId,
          role: user.role,
          name: user.name,
          email: user.email,
          city: user.city,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  guestAuth,
  register,
  login,
  upgradeGuest,
  getMe,
};

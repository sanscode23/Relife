const { getImpactMetrics } = require('../services/impactService');

const getGlobalImpact = async (req, res, next) => {
  try {
    const metrics = await getImpactMetrics(null);
    return res.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    next(error);
  }
};

const getUserImpact = async (req, res, next) => {
  try {
    const metrics = await getImpactMetrics(req.user.userId);
    return res.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGlobalImpact,
  getUserImpact,
};

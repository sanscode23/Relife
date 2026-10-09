const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'UP',
      timestamp: new Date().toISOString(),
      service: 'RE:LIFE Backend API',
    },
  });
};

module.exports = { getHealth };

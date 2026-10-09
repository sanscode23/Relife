const { nanoid } = require('nanoid');

const generateDeviceId = () => {
  return `dev_${nanoid(10)}`;
};

const generateUserId = () => {
  return `usr_${nanoid(10)}`;
};

const generateVerificationId = () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `RL-${year}-${randomNum}`;
};

module.exports = {
  generateDeviceId,
  generateUserId,
  generateVerificationId,
};

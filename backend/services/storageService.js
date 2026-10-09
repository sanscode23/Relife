const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const env = require('../config/env');

let s3Client = null;
if (env.IMAGE_STORAGE === 's3') {
  try {
    const config = { region: env.AWS_REGION };
    if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY) {
      config.credentials = {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      };
    }
    s3Client = new S3Client(config);
  } catch (err) {
    console.warn('⚠️ S3 Client Initialization Failed, falling back to local storage:', err.message);
  }
}

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const saveFile = async (file) => {
  if (!file) return null;

  const fileExt = path.extname(file.originalname) || '.jpg';
  const fileName = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${fileExt}`;

  if (env.IMAGE_STORAGE === 's3' && s3Client) {
    try {
      const command = new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: `devices/${fileName}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      });
      await s3Client.send(command);
      return `https://${env.S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/devices/${fileName}`;
    } catch (err) {
      console.warn('⚠️ S3 upload error, saving locally fallback:', err.message);
    }
  }

  // Local storage fallback
  const filePath = path.join(uploadsDir, fileName);
  fs.writeFileSync(filePath, file.buffer || fs.readFileSync(file.path));
  return `/uploads/${fileName}`;
};

module.exports = {
  saveFile,
  uploadsDir,
};

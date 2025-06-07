const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());

const uploadDir = 'uploads';
const videosDir = 'videos';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir + '/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

app.use('/videos', express.static(path.join(__dirname, videosDir)));

app.post('/convert', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Görsel yüklenemedi.' });
  }

  const imagePath = req.file.path;
  const duration = req.body.duration || 5;

  console.log(`Görsel yolu: ${imagePath}, Süre: ${duration} saniye.`);

  const simulatedVideoFileName = `simulated-video-${Date.now()}.mp4`;
  const simulatedVideoUrl = `${req.protocol}://${req.get('host')}/videos/${simulatedVideoFileName}`;

  fs.unlink(imagePath, (err) => {
    if (err) console.error('Geçici görsel silinirken hata oluştu:', err);
  });

  res.json({
    message: 'Görsel dönüştürme simüle edildi. Gerçek video Render\'da oluşacaktır.',
    videoUrl: simulatedVideoUrl
  });
});

app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Node.js sunucusu ${port} portunda çalışıyor (Simülasyon Modu).`);
});

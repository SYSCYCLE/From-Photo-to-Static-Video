const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

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
  const outputFileName = `video-${Date.now()}.mp4`;
  const outputPath = path.join(__dirname, videosDir, outputFileName);

  const ffmpegCommand = `ffmpeg -loop 1 -i ${imagePath} -c:v libx264 -t ${duration} -pix_fmt yuv420p -vf "pad=ceil(iw/2)*2:ceil(ih/2)*2" -r 25 ${outputPath}`;

  console.log(`FFmpeg komutu çalıştırılıyor: ${ffmpegCommand}`);

  // maxBuffer'ı 50MB'a çıkarıyoruz ve timeout ekliyoruz (120 saniye = 2 dakika)
  exec(ffmpegCommand, { maxBuffer: 1024 * 1024 * 50, timeout: 120000 }, (error, stdout, stderr) => {
    fs.unlink(imagePath, (err) => {
      if (err) console.error('Geçici görsel silinirken hata oluştu:', err);
    });

    if (error) {
      console.error(`exec error: ${error.message}`);
      let errorMessage = 'Video dönüştürülürken bir hata oluştu.';

      if (error.killed && error.signal === 'SIGTERM') {
        errorMessage = 'Video dönüştürme işlemi zaman aşımına uğradı. Lütfen daha küçük bir görsel deneyin veya daha kısa bir süre seçin.';
      } else if (stderr.includes('maxBuffer')) {
          errorMessage = 'Video dönüştürme çıktısı çok büyük oldu. Lütfen daha küçük bir görsel deneyin veya daha kısa bir süre seçin.';
      }
      return res.status(500).json({
        message: errorMessage,
        error: error.message,
        details: stderr
      });
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);

    const videoUrl = `${req.protocol}://${req.get('host')}/videos/${outputFileName}`;
    res.json({
      message: 'Görsel başarıyla videoya dönüştürüldü!',
      videoUrl: videoUrl,
      fileName: outputFileName
    });
  });
});

app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Node.js sunucusu ${port} portunda çalışıyor.`);
});

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}
if (!fs.existsSync('videos')) {
  fs.mkdirSync('videos');
}

app.use('/videos', express.static(path.join(__dirname, 'videos')));

app.post('/convert', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Görsel yüklenemedi.' });
  }

  const imagePath = req.file.path;
  const duration = req.body.duration || 5;
  const outputFileName = `video-${Date.now()}.mp4`;
  const outputPath = path.join(__dirname, 'videos', outputFileName);
  const ffmpegCommand = `ffmpeg -loop 1 -i ${imagePath} -c:v libx264 -t ${duration} -pix_fmt yuv420p -vf "scale=640:360,setsar=1" ${outputPath}`;

  console.log(`FFmpeg komutu çalıştırılıyor: ${ffmpegCommand}`);

  exec(ffmpegCommand, (error, stdout, stderr) => {
    fs.unlink(imagePath, (err) => {
      if (err) console.error('Geçici görsel silinirken hata oluştu:', err);
    });

    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).json({ message: 'Video dönüştürülürken bir hata oluştu.', error: error.message });
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

app.listen(port, () => {
  console.log(`Server ${port} portunda çalışıyor`);
});

import React, { useState } from 'react';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoDuration, setVideoDuration] = useState(5);
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [message, setMessage] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setMessage('');
    setVideoUrl('');
  };

  const handleDurationChange = (event) => {
    const duration = Math.max(1, parseInt(event.target.value, 10));
    setVideoDuration(duration);
  };

  const handleConvert = async () => {
    if (!selectedFile) {
      setMessage('Lütfen önce bir görsel seçin.');
      return;
    }

    setLoading(true);
    setMessage('Video oluşturuluyor, lütfen bekleyin...');
    setVideoUrl('');

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('duration', videoDuration);

    try {
      const response = await fetch('/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Video dönüştürme başarısız oldu.');
      }

      const data = await response.json();
      setMessage(data.message);
      setVideoUrl(data.videoUrl || 'https://placehold.co/640x360/000000/FFFFFF?text=Video+Burada+Olucak');
    } catch (error) {
      console.error('Dönüştürme hatası:', error);
      setMessage(`Hata: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
          Görselden Videoya Dönüştürücü
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Yüklediğiniz görseli, seçtiğiniz sürede statik bir videoya dönüştürün.
        </p>

        <div className="mb-6">
          <label htmlFor="image-upload" className="block text-gray-700 text-sm font-bold mb-2">
            1. Görsel Seçin:
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {selectedFile && (
            <p className="mt-2 text-sm text-gray-500">Seçilen Dosya: {selectedFile.name}</p>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="video-duration" className="block text-gray-700 text-sm font-bold mb-2">
            2. Video Süresi (saniye):
          </label>
          <input
            id="video-duration"
            type="number"
            min="1"
            value={videoDuration}
            onChange={handleDurationChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          onClick={handleConvert}
          disabled={loading || !selectedFile}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Dönüştürülüyor...' : 'Videoya Dönüştür'}
        </button>

        {message && (
          <div className={`mt-6 p-3 rounded-md text-center ${loading ? 'bg-blue-100 text-blue-700' : (message.includes('Hata') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700')}`}>
            {message}
          </div>
        )}

        {videoUrl && (
          <div className="mt-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Oluşturulan Video:</h3>
            <video
              controls
              src={videoUrl}
              className="w-full h-auto rounded-lg shadow-md border border-gray-300"
            >
              Tarayıcınız video etiketini desteklemiyor.
            </video>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoDuration, setVideoDuration] = useState(5);
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [message, setMessage] = useState('');
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

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

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${theme === 'dark' ? 'bg-[#202030] text-gray-100' : 'bg-gray-100 text-gray-800'}`}>
      <div className={`p-8 rounded-lg shadow-xl max-w-md w-full transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleTheme}
            className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#336699] focus:ring-opacity-50 ${
              theme === 'dark' ? 'bg-[#336699]' : 'bg-gray-300'
            }`}
            aria-label={theme === 'dark' ? 'Açık Temaya Geç' : 'Koyu Temaya Geç'}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 ease-in-out ${
                theme === 'dark' ? 'translate-x-9' : 'translate-x-1'
              } flex items-center justify-center`}
            >
              {theme === 'dark' ? <Moon size={16} className="text-gray-800" /> : <Sun size={16} className="text-yellow-500" />}
            </span>
          </button>
        </div>

        <h1 className={`text-3xl font-extrabold mb-6 text-center ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
          Görselden Videoya Dönüştürücü
        </h1>
        <p className={`mb-6 text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Yüklediğiniz görseli, seçtiğiniz sürede statik bir videoya dönüştürün.
        </p>

        <div className="mb-6">
          <label htmlFor="image-upload" className={`block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            1. Görsel Seçin:
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-[#336699] focus:border-[#336699] file:bg-[#336699] file:text-white hover:file:bg-[#2A527A]'
                : 'bg-white border-gray-300 text-gray-800 focus:ring-[#336699] focus:border-[#336699] file:bg-[#E6F0F8] file:text-[#336699] hover:file:bg-[#CCE0ED]'
            } file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold`}
          />
          {selectedFile && (
            <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Seçilen Dosya: {selectedFile.name}</p>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="video-duration" className={`block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            2. Video Süresi (saniye):
          </label>
          <input
            id="video-duration"
            type="number"
            min="1"
            value={videoDuration}
            onChange={handleDurationChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-[#336699] focus:border-[#336699]'
                : 'bg-white border-gray-300 text-gray-800 focus:ring-[#336699] focus:border-[#336699]'
            }`}
          />
        </div>

        <button
          onClick={handleConvert}
          disabled={loading || !selectedFile}
          className={`w-full font-bold py-3 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed
            ${loading ? 'bg-gradient-to-r from-[#336699] via-[#407ACC] to-[#336699] animate-loading-swipe' : ''}
            ${!loading && (theme === 'dark' ? 'bg-[#336699] text-white hover:bg-[#2A527A] focus:ring-[#336699]' : 'bg-gradient-to-r from-[#336699] to-[#2A527A] text-white hover:from-[#2A527A] hover:to-[#204060] focus:ring-[#336699]')}
          `}
        >
          {loading ? 'Dönüştürülüyor...' : 'Videoya Dönüştür'}
        </button>

        {message && (
          <div className={`mt-6 p-3 rounded-md text-center ${
            loading
              ? (theme === 'dark' ? 'bg-[#1A334D] text-[#99CCFF]' : 'bg-[#CCE0ED] text-[#2A527A]')
              : (message.includes('Hata')
                  ? (theme === 'dark' ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700')
                  : (theme === 'dark' ? 'bg-[#1A334D] text-[#99CCFF]' : 'bg-[#CCE0ED] text-[#2A527A]'))
          }`}>
            {message}
          </div>
        )}

        {videoUrl && (
          <div className="mt-6">
            <h3 className={`text-lg font-bold mb-2 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Oluşturulan Video:</h3>
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

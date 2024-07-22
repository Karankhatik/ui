import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; 

const App = () => {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

  // Handle file input change
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) return;

    try {
      // Get presigned URL from backend
      const { data } = await axios.post('http://localhost:5000/api/generate-presigned-url', {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });

      const { presignedUrl, url } = data;

      // Upload file to S3 using the presigned URL
      await axios.put(presignedUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
      });

      // Fetch the image using the URL
      const imageResponse = await axios.get(`http://localhost:5000/api/image/${file.name}`, {
        responseType: 'blob'
      });

      const imageBlob = new Blob([imageResponse.data], { type: file.type });
      const imageObjectUrl = URL.createObjectURL(imageBlob);

      // Set image URL to display
      setImageUrl(imageObjectUrl);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div className="container">
      <input type="file" onChange={handleFileChange} className="file-input" />
      <button onClick={handleUpload} className="upload-button">Upload</button>
      {imageUrl && (
        <div className="image-container">
          <img src={imageUrl} alt="Uploaded" className="uploaded-image" />
        </div>
      )}
    </div>
  );
};

export default App;

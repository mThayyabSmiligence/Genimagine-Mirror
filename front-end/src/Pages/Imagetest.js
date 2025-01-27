import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Imagetest() {
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null); // Handle errors gracefully
  const [loading, setLoading] = useState(false); // Track loading state

  useEffect(() => {
    generateImage();
  }, []);

  const generateImage = async () => {
    setLoading(true); // Start loading
    try {
      const response = await axios.post(
        'http://localhost:3001/api/v1/generate-image',
        { prompt: 'super cow' },
        { responseType: 'arraybuffer' } // Ensure the response is handled as binary
      );

      // Convert binary data to a base64-encoded string
      const base64Image = `data:image/png;base64,${btoa(
        new Uint8Array(response.data)
          .reduce((data, byte) => data + String.fromCharCode(byte), '')
      )}`;

      setImage(base64Image);
    } catch (error) {
      console.error('Error generating image:', error);
      setError('Failed to generate image. Please try again later.');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      {loading && <p>Generating image...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {image && <img src={image} alt="Generated" style={{ maxWidth: '100%', height: 'auto' }} />}
    </div>
  );
}

import React, { useState, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import './MessageInput.css';

const MessageInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() || images.length > 0) {
      onSendMessage(message, images);
      setMessage('');
      setImages([]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      setImages(prev => [...prev, ...imageFiles]);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <form className="message-input" onSubmit={handleSubmit}>
      {images.length > 0 && (
        <div className="image-preview-container">
          {images.map((image, index) => (
            <div key={index} className="image-preview">
              <img src={URL.createObjectURL(image)} alt={`Preview ${index}`} />
              <button 
                type="button" 
                className="remove-image" 
                onClick={() => removeImage(index)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="input-container">
        <button 
          type="button" 
          className="upload-button" 
          onClick={() => fileInputRef.current.click()}
          disabled={disabled}
        >
          📷
        </button>
        
        <TextareaAutosize
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          minRows={1}
          maxRows={5}
          disabled={disabled}
          className="text-input"
        />
        
        <button 
          type="submit" 
          className="send-button" 
          disabled={disabled || (message.trim() === '' && images.length === 0)}
        >
          📤
        </button>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          disabled={disabled}
        />
      </div>
    </form>
  );
};

export default MessageInput; 
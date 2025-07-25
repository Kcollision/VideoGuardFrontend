import React from 'react';
import '../styles/LoadingSpinner.css';

const LoadingSpinner = ({ message = '加载中...' }) => {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p className="loading-message">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
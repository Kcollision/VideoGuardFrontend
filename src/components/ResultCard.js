import React from 'react';
import '../styles/ResultCard.css';

const ResultCard = ({ title, children }) => {
  return (
    <div className="result-card">
      <h3 className="card-title">{title}</h3>
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};

export default ResultCard;
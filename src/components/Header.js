import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Header.css';

const Header = ({ title }) => {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate('/');
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo" onClick={handleHomeClick}>
          <span className="logo-text">多媒体检测</span>
        </div>
        {title && <h1 className="page-title">{title}</h1>}
        <div className="header-actions">
          <button className="home-button" onClick={handleHomeClick}>
            首页
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
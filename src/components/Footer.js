import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p>© {currentYear} 多媒体内容检测系统 | 版权所有</p>
        <div className="footer-links">
          <a href="#about">关于我们</a>
          <a href="#privacy">隐私政策</a>
          <a href="#terms">使用条款</a>
          <a href="#contact">联系我们</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
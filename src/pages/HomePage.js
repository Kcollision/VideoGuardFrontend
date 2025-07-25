import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Statistic, Timeline, Badge } from 'antd';
import { VideoCameraOutlined, AudioOutlined, FileTextOutlined, SafetyOutlined, RocketOutlined, BarChartOutlined, LockOutlined } from '@ant-design/icons';
import '../styles/HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);

  // 自动切换特性展示
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000); // 减少切换时间
    return () => clearInterval(interval);
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
  };

  // 优化特性数据，添加图标
  const features = [
    {
      title: "高精度识别",
      description: "采用先进的深度学习算法，实现对视频、音频和文本内容的高精度识别和分析。",
      icon: <SafetyOutlined style={{ fontSize: '48px', color: '#fff' }} />
    },
    {
      title: "实时处理",
      description: "强大的处理引擎支持大规模数据的实时分析，快速获取检测结果。",
      icon: <RocketOutlined style={{ fontSize: '48px', color: '#fff' }} />
    },
    {
      title: "多维度分析",
      description: "从多个维度对内容进行全方位分析，提供详细的检测报告和数据可视化。",
      icon: <BarChartOutlined style={{ fontSize: '48px', color: '#fff' }} />
    },
    {
      title: "安全可靠",
      description: "严格的数据保护机制，确保用户上传的内容安全可靠，隐私得到充分保障。",
      icon: <LockOutlined style={{ fontSize: '48px', color: '#fff' }} />
    }
  ];

  // 检测类型数据
  const detectionTypes = [
    {
      key: '/video-detection',
      title: '视频检测',
      description: '智能分析视频内容，识别有害场景和行为',
      icon: <VideoCameraOutlined />,
      features: ['场景识别', '动作分析', '物体检测', '人脸识别'],
      color: '#ff4d4f',
      gradient: 'linear-gradient(135deg, #1890ff, #40a9ff)'
    },
    {
      key: '/audio-detection',
      title: '音频检测',
      description: '深度分析音频内容，识别语音和环境音',
      icon: <AudioOutlined />,
      features: ['语音识别', '情感分析', '语种识别', '噪音过滤'],
      color: '#52c41a',
      gradient: 'linear-gradient(135deg, #1890ff, #40a9ff)'
    },
    {
      key: '/text-detection',
      title: '文本检测',
      description: '智能分析文本内容，识别敏感词汇和情感',
      icon: <FileTextOutlined />,
      features: ['敏感词检测', '情感分析', '语义理解', '主题分类'],
      color: '#1890ff',
      gradient: 'linear-gradient(135deg, #1890ff, #40a9ff)'
    }
  ];

  return (
    <div className="home-container">
      {/* 渐变背景 */}
      <div className="gradient-background">
        <div className="blur-overlay"></div>
      </div>
      
      {/* 导航栏优化 */}
      <header className="home-header">
        <div className="logo">
          <span className="logo-icon">🛡️</span>
          <h2>VideoGuard</h2>
        </div>
        <nav className="nav-links">
          <a href="#features">特性</a>
          <a href="#stats">数据</a>
          <a href="#about">关于</a>
        </nav>
      </header>

      <div className="home-content">
        {/* Hero区域优化 */}
        <div className="hero-section">
          <div className="hero-badge">
            <Badge.Ribbon text="AI驱动" color="gold">
              <div className="hero-title-wrapper">
                <h1>基于大模型与多模态融合的<br/>短视频平台有害内容检测系统</h1>
              </div>
            </Badge.Ribbon>
          </div>
          <p className="hero-description">
            🚀 基于人工智能的全方位内容分析平台，为您提供视频、音频和文本的智能检测服务
          </p>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="stat-number">92.9%</span>
              <span className="stat-label">准确率</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">10s</span>
              <span className="stat-label">平均检测耗时</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">24/7</span>
              <span className="stat-label">在线服务</span>
            </div>
          </div>
          <div className="cta-buttons">
            <button className="primary-button" onClick={() => handleNavigation('/video-detection')}>
              <span>立即开始</span>
              <span className="button-arrow">→</span>
            </button>
            <button className="secondary-button" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              了解更多
            </button>
          </div>
        </div>
        
        {/* 检测类型卡片优化 */}
        <div id="features" className="features-section">
          <div className="section-header">
            <h2 className="section-title">🎯 选择检测类型</h2>
            <p className="section-description">我们提供多种媒体内容的智能检测服务，满足您的不同需求</p>
          </div>
          
          <Row gutter={[24, 24]} className="detection-cards-row">
            {detectionTypes.map((type, index) => (
              <Col xs={24} md={8} key={type.key}>
                <Card
                  className="detection-card-new"
                  hoverable
                  onClick={() => handleNavigation(type.key)}
                  style={{
                    background: type.gradient,
                    border: 'none',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    height: '320px'
                  }}
                  bodyStyle={{ 
                    padding: '32px 24px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div className="card-icon-wrapper">
                      {React.cloneElement(type.icon, { style: { fontSize: '48px', color: '#fff' } })}
                    </div>
                    <h3 style={{ color: '#fff', fontSize: '24px', marginBottom: '12px', fontWeight: 600 }}>
                      {type.title}
                    </h3>
                    <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
                      {type.description}
                    </p>
                  </div>
                  <div className="card-features-new">
                    {type.features.map((feature, idx) => (
                      <span key={idx} className="feature-tag">
                        {feature}
                      </span>
                    ))}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
        
        {/* 系统特性轮播优化 */}
        <div className="feature-showcase">
          <h2 className="section-title">💡 系统特性</h2>
          <div className="feature-carousel">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`feature-item ${index === activeFeature ? 'active' : ''}`}
              >
                <div className="feature-icon-new">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
            <div className="carousel-indicators">
              {features.map((_, index) => (
                <span 
                  key={index} 
                  className={`indicator ${index === activeFeature ? 'active' : ''}`}
                  onClick={() => setActiveFeature(index)}
                ></span>
              ))}
            </div>
          </div>
        </div>
        
        {/* 统计数据优化 */}
        <div id="stats" className="stats-section">
          {/* 居中显示 */}
          <Row gutter={[32, 32]}>
            <Col >
              <Statistic
                title="检测准确率"
                value={99.2}
                precision={1}
                suffix="%"
                valueStyle={{ color: '#fff', fontSize: '2.5rem', fontWeight: 'bold' }}
                prefix="🎯"
              />
            </Col>
         
            <Col>
              <Statistic
                title="处理数据量"
                value={1000}
                suffix="MB+"
                valueStyle={{ color: '#fff', fontSize: '2.5rem', fontWeight: 'bold' }}
                prefix="📊"
              />
              </Col>

            <Col >
              <Statistic
                title="全天候服务"
                value="24/7"
                valueStyle={{ color: '#fff', fontSize: '2.5rem', fontWeight: 'bold' }}
                prefix="🕒"
              />
            </Col>
          </Row>
        </div>

        {/* 新增时间线组件 */}
        <div className="timeline-section">
          <h2 className="section-title">🚀 发展历程</h2>
          <Timeline
            mode="alternate"
            items={[
              {
                children: '项目启动，核心算法研发',
                color: 'blue',
              },
              {
                children: '多模态融合技术突破',
                color: 'green',
              },
              {
                children: '持续优化升级中...',
                color: 'gray',
              },
            ]}
          />
        </div>
      </div>
      
      {/* 页脚优化 */}
      <footer className="home-footer">
        <div className="footer-content">
          <p>© 2025 面向短视频平台的有害内容检测与阻断系统 | 版权所有</p>
          <div className="footer-links">
            <a href="#privacy">隐私政策</a>
            <a href="#terms">服务条款</a>
            <a href="#contact">联系我们</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
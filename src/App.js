import React from 'react';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import { Layout, Menu, Button } from 'antd';
import { HomeOutlined,VideoCameraOutlined, AudioOutlined, FileTextOutlined } from '@ant-design/icons';
import './App.css';
import HomePage from './pages/HomePage';
import VideoDetectionPage from './pages/VideoDetectionPage';
import AudioDetectionPage from './pages/AudioDetectionPage';
import TextDetectionPage from './pages/TextDetectionPage';

const { Header, Content } = Layout;

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 导航项，添加图标
  const navItems = [
    { 
      key: '/video-detection', 
      label: (
        <>
          <VideoCameraOutlined style={{ marginRight: 6 }} />
          视频检测
        </>
      )
    },
    { 
      key: '/audio-detection', 
      label: (
        <>
          <AudioOutlined style={{ marginRight: 6 }} />
          音频检测
        </>
      )
    },
    { 
      key: '/text-detection', 
      label: (
        <>
          <FileTextOutlined style={{ marginRight: 6 }} />
          文本检测
        </>
      )
    },
  ];
  
  // 获取当前选中的菜单项
  const selectedKey = navItems.find(item => location.pathname === item.key)?.key || '';
  
  // 跳转到首页
  const goHome = () => {
    navigate('/');
  };
  
  // 判断是否是首页
  const isHomePage = location.pathname === '/' || location.pathname === '';
  
  return (
    <div className={isHomePage ? "home-container" : ""}>
      <Layout className="app-layout" style={{ minHeight: '100vh', background: 'transparent' }}>
      {!isHomePage && (
          <Header style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '0 20px',
            background: '#ffffff' // 卡其色背景
          }}>
            <Menu
              mode="horizontal"
              selectedKeys={[selectedKey]}
              items={navItems}
              onClick={({ key }) => navigate(key)}
              style={{ 
                flex: 1, 
                background: '#ffffff', // 卡其色背景
                color: '#000000' // 黑色字体
              }}
              theme="light" // 使用亮色主题
              // 自定义样式，确保选中项为白色背景，黑色字体
              className="custom-menu"
            />
            <Button 
              type="primary" 
              icon={<HomeOutlined />} 
              onClick={goHome}
              style={{ 
                marginLeft: 16, 
                background: 'black', 
                // color: '#000000', // 黑色字体
                // border: '1px solidrgb(228, 242, 248)' // 卡其色边框
              }}
            >
              回到首页
            </Button>
          </Header>
        )}
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/video-detection" element={<VideoDetectionPage />} />
          <Route path="/audio-detection" element={<AudioDetectionPage />} />
          <Route path="/text-detection" element={<TextDetectionPage />} />
        </Routes>
        
      </Layout>
    </div>
  );
}

export default App;
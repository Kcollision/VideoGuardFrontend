import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/DetectionPage.css';
import { SERVER_AUDIO } from '../api/Api';
import { Upload, Button, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';

const { Dragger } = Upload;

const AudioDetectionPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();
  
  // 新增进度条相关状态
  const [detectionProgress, setDetectionProgress] = useState(0);
  const [progressInterval, setProgressInterval] = useState(null);
    
  const success = (str1) => {
    messageApi.open({
      type: 'success',
      content: str1,
      duration: 2,
    });
  };

  const error = (str1) => {
    messageApi.open({
      type: 'error',
      content: str1,
      duration: 2,
    });
  };

  const warning = (str1) => {
    messageApi.open({
      type: 'warning',
      content: str1,
      duration: 2,
    });
  };

  // 开始假进度条
  const startFakeProgress = () => {
    setDetectionProgress(0);
    const interval = setInterval(() => {
      setDetectionProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 1000); // 每秒增加10%
    setProgressInterval(interval);
  };

  // 清理进度条
  const clearProgress = () => {
    if (progressInterval) {
      clearInterval(progressInterval);
      setProgressInterval(null);
    }
  };

  // 重新上传
  const handleReupload = () => {
    clearProgress();
    setSelectedFile(null);
    setResults(null);
    setAudioPreview(null);
    setDetectionProgress(0);
  };

  // 上传并检测
  const handleUpload = async () => {
    if (!selectedFile) {
      warning('请先选择一个音频文件');
      return;
    }
    setIsProcessing(true);
    setResults(null);
    
    // 开始假进度条
    startFakeProgress();
    
    try {
      const formData = new FormData();
      formData.append('audio', selectedFile);
      const response = await axios.post(SERVER_AUDIO, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // 完成进度条到100%
      setDetectionProgress(100);
      
      // 处理后端返回的字符串JSON
      const data = response.data;
      if (typeof data.audio_details === 'string') {
        data.audio_details = JSON.parse(data.audio_text);
      }
      if (typeof data.audio_violation === 'string') {
        data.audio_violation = JSON.parse(data.audio_violation);
      }
      success('音频处理完成!');
      setResults(response.data);
      
      console.log('检测结果:', results);
    } catch (error) {
      error('处理音频时出错，请重试');
    } finally {
      clearProgress();
      setIsProcessing(false);
    }
  };

  return (
    <>
      {contextHolder}
      <center>
        <div className="detection-container">
          <h1>音频内容检测</h1>

          <div className="upload-section" style={{ width: 400, margin: '0 auto' }}>
            {!selectedFile ? (
              <Dragger
                name="audio"
                accept="audio/*"
                multiple={false}
                showUploadList={false}
                beforeUpload={file => {
                  setSelectedFile(file);
                  setResults(null);
                  setAudioPreview(URL.createObjectURL(file));
                  return false; // 阻止自动上传
                }}
                style={{ padding: 16 }}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">点击或拖拽音频文件到此区域上传</p>
                <p className="ant-upload-hint">仅支持单个音频文件</p>
              </Dragger>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <div className="file-info">
                  <p>已选择: {selectedFile.name}</p>
                </div>
                <div className="preview-section">
                  <audio controls src={audioPreview} className="audio-preview" />
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <Button onClick={handleReupload} disabled={isProcessing}>
                    重新上传
                  </Button>
                  <Button
                    type="primary"
                    onClick={handleUpload}
                    loading={isProcessing}
                    disabled={isProcessing}
                  >
                    {isProcessing ? '处理中...' : '开始检测'}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {isProcessing && (
            <div className="processing-indicator">
              <div style={{ width: 400, margin: '0 auto' }}>
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <div style={{
                    width: `${detectionProgress}%`,
                    height: '100%',
                    backgroundColor: '#1890ff',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease-in-out',
                    position: 'absolute',
                    left: 0,
                    top: 0
                  }}></div>
                </div>
              </div>
              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }}>
                  {Math.round(detectionProgress)}%
                </span>
              </div>
              <p style={{ marginTop: 8, fontSize: 12, color: '#666', textAlign: 'center' }}>
                {detectionProgress >= 90 ? '正在等待服务器返回结果...' : '正在处理音频，请稍候...'}
              </p>
            </div>
          )}

          {results && (
            <div className="results-section">
              <h2>检测结果</h2>
              <div className="summary-box">
                <h3>音频转写</h3>
                <p>{results.audio_text}</p>
              </div>
              <div className="summary-box"
                  style={{
                    background: results['audio_violation'][0] === '正常'
                      ? ' #e6ffed'
                      : ' #fff1f0',
                    border: '1px solid',
                    borderColor: results['audio_violation'][0] === '正常'
                      ? ' #52c41a'
                      : ' #ff4d4f'
                  }}
                >
                  <h3>识别类型</h3>
                  <p>
                    {results.audio_violation?.join('，')}
                  </p>
              </div>
              
              {results.audio_violation_texts?.length >=1 && (
                <div className="transcription-box"
                style={{
                background:' #fff1f0',
                border: '1px solid',
                borderColor:' #ff4d4f'
                }}
                >
                  <h3>违规片段</h3>
                  <p>
                    {results.audio_violation_texts?.join('，')}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </center>
    </>
  );
};

export default AudioDetectionPage;
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/DetectionPage.css';
import { Button, message, Radio } from 'antd';
import 'antd/dist/reset.css';
import { SERVER_TEXT } from '../api/Api';
import axios from 'axios';

const TextDetectionPage = () => {
  const navigate = useNavigate();
  const [inputType, setInputType] = useState('text'); // 'text' or 'file'
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const fileInputRef = useRef(null);
  
  // 新增进度条相关状态
  const [detectionProgress, setDetectionProgress] = useState(0);
  const [progressInterval, setProgressInterval] = useState(null);

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

  // 切换输入方式
  const handleInputTypeChange = (e) => {
    const type = e.target.value;
    setInputType(type);
    setInputText('');
    setSelectedFile(null);
    setResults(null);
    setDetectionProgress(0);
    clearProgress();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 文本输入
  const handleTextChange = (event) => {
    setInputText(event.target.value);
    setResults(null);
  };

  // 文件选择
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setResults(null);
      // 只支持 txt 预览内容
      if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => {
          setInputText(e.target.result);
        };
        reader.readAsText(file);
      } else {
        setInputText('');
      }
    }
  };

  // 检测
  const handleProcess = async () => {
    let text = inputText;
    if (inputType === 'file' && selectedFile && !inputText) {
      message.warning('暂不支持非txt文件内容读取，请上传txt或手动输入文本');
      return;
    }
    if (!text) {
      message.warning('请输入文本或上传文件');
      return;
    }
    setIsProcessing(true);
    setResults(null);
    
    // 开始假进度条
    startFakeProgress();
    
    try {
      const response = await axios.post(SERVER_TEXT, { text });
      
      // 完成进度条到100%
      setDetectionProgress(100);
      
      setResults(response.data);
    } catch (err) {
      message.error('处理文本时出错，请重试');
    } finally {
      clearProgress();
      setIsProcessing(false);
    }
  };

  // 重新上传
  const handleReupload = () => {
    clearProgress();
    setSelectedFile(null);
    setInputText('');
    setResults(null);
    setDetectionProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <center>
    <div className="detection-container">
      <h1>文本内容检测</h1>
      {/* 输入方式切换Radio */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <Radio.Group
          value={inputType}
          onChange={handleInputTypeChange}
          buttonStyle="solid"
        >
          <Radio.Button value="text">文本输入</Radio.Button>
          <Radio.Button value="file">文件上传</Radio.Button>
        </Radio.Group>
      </div>

      {/* 文本输入区域 */}
      {inputType === 'text' && (
        <div style={{ width: 400, margin: '0 auto', marginBottom: 24 }}>
          <textarea
            value={inputText}
            onChange={handleTextChange}
            placeholder="请输入要检测的文本..."
            rows={8}
            className="text-area"
            style={{ width: '100%' }}
          />
        </div>
      )}

      {/* 文件上传区域 */}
      {inputType === 'file' && (
        <div style={{ width: 400, margin: '0 auto', marginBottom: 24 }}>
          {!selectedFile ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <input
                type="file"
                accept=".txt"
                onChange={handleFileChange}
                ref={fileInputRef}
                style={{ display: 'none' }}
              />
              <Button onClick={() => fileInputRef.current.click()} style={{ width: 160 }}>
                选择文件
              </Button>
              <div style={{ color: '#888', fontSize: 13 }}>支持txt文件</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div>
                <span style={{ fontWeight: 500 }}>已选择：</span>
                <span>{selectedFile.name}</span>
              </div>
              {selectedFile.type === 'text/plain' && (
                <textarea
                  value={inputText}
                  onChange={handleTextChange}
                  rows={8}
                  className="text-area"
                  style={{ width: '100%' }}
                />
              )}
              <Button onClick={handleReupload} disabled={isProcessing}>
                重新上传
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 检测按钮 */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Button
          type="primary"
          onClick={handleProcess}
          loading={isProcessing}
          disabled={isProcessing || (!inputText && !selectedFile)}
          style={{ width: 160 }}
        >
          {isProcessing ? '处理中...' : '开始检测'}
        </Button>
      </div>

      {/* 处理中指示 */}
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
            {detectionProgress >= 90 ? '正在等待服务器返回结果...' : '正在处理文本，请稍候...'}
          </p>
        </div>
      )}

      {/* 检测结果 */}
      {results && (
        <div className="results-section">
          <h2>检测结果</h2>
            <div className="summary-box"
            style={{
            background:results['violation_categories'][0] === '正常'
              ? ' #e6ffed'
              : ' #fff1f0',
            border: '1px solid',
            borderColor:results['violation_categories'][0] === '正常'
              ? ' #52c41a'
              : ' #ff4d4f'
              }}
            >
            <h3>识别类型</h3>
            <p>
              {results['violation_categories']?.join('，')}
            </p>
          </div>
          {/* 仅当不是"正常"时显示违规片段 */}
          {!(results['violation_categories']?.length === 1 && results['violation_categories'][0] === '正常') && (
            <div className="summary-box"
            style={{
            background:results['violation_categories'][0] === '正常'
              ? ' #e6ffed'
              : ' #fff1f0',
            border: '1px solid',
            borderColor:results['violation_categories'][0] === '正常'
              ? ' #52c41a'
              : ' #ff4d4f'
          }}  
            >
              <h3>违规片段</h3>
              <p>
                {results['violation_texts']?.join('，')}
              </p>
            </div>
          )}
        </div>
      )}
      </div>
      </center>
  );
};

export default TextDetectionPage;
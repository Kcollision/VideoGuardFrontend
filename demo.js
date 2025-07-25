import React, { useState, useRef } from 'react';
import axios from 'axios';

const SERVER_URL = "http://10.100.8.50:8000/process";
const SERVER_URL_LINK = "http://10.100.8.50:8000/process_url";

const class_en2zh = {
  normal: '正常',
  porn: '色情',
  violence: '暴力',
  bloody: '血腥',
};

function VideoDetectPage() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionProgress, setDetectionProgress] = useState(0);
  const [detectionComplete, setDetectionComplete] = useState(false);
  const [detectionResult, setDetectionResult] = useState('');
  const [isHarmful, setIsHarmful] = useState(false);
  const [harmfulFrames, setHarmfulFrames] = useState([]);
  const [violationImages, setViolationImages] = useState([]);
  const [pdfData, setPdfData] = useState(null);
  const [hasPdfReport, setHasPdfReport] = useState(false);
  const [isLinkMode, setIsLinkMode] = useState(false);
  const [videoLink, setVideoLink] = useState('');
  const [showViolationImages, setShowViolationImages] = useState(false);

  const fileInputRef = useRef();

  // 上传本地视频
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setDetectionComplete(false);
      setDetectionResult('');
      setHarmfulFrames([]);
      setViolationImages([]);
      setPdfData(null);
      setHasPdfReport(false);
    }
  };

  // 切换上传模式
  const toggleMode = () => {
    setIsLinkMode(!isLinkMode);
    setVideoFile(null);
    setVideoUrl('');
    setVideoLink('');
    setDetectionComplete(false);
    setDetectionResult('');
    setHarmfulFrames([]);
    setViolationImages([]);
    setPdfData(null);
    setHasPdfReport(false);
  };

  // 处理视频检测
  const handleDetect = async () => {
    setIsDetecting(true);
    setDetectionProgress(0);
    setDetectionComplete(false);

    try {
      if (isLinkMode && videoLink) {
        // 链接模式
        await processVideoLink();
      } else if (videoFile) {
        // 文件上传模式
        await uploadVideoFile();
      }
    } catch (e) {
      setDetectionResult('检测失败: ' + e.message);
      setDetectionComplete(true);
    } finally {
      setIsDetecting(false);
    }
  };

  // 上传本地视频文件
  const uploadVideoFile = async () => {
    const formData = new FormData();
    formData.append('video', videoFile);

    // 进度条模拟
    for (let i = 0; i <= 80; i++) {
      await new Promise(res => setTimeout(res, 30));
      setDetectionProgress(i / 100);
    }

    const response = await axios.post(SERVER_URL, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          setDetectionProgress(Math.min(progressEvent.loaded / progressEvent.total, 0.8));
        }
      }
    });

    setDetectionProgress(1.0);
    processResponse(response.data);
  };

  // 处理视频链接
  const processVideoLink = async () => {
    // 进度条模拟
    for (let i = 0; i <= 100; i++) {
      await new Promise(res => setTimeout(res, 30));
      setDetectionProgress(i / 100);
    }

    const response = await axios.post(SERVER_URL_LINK, { url: videoLink }, {
      headers: { 'Content-Type': 'application/json' }
    });

    processResponse(response.data);
  };

  // 处理服务器响应
  const processResponse = (result) => {
    let video_class = result.video_main_category || "normal";
    let video_class_2 = result.video_second_category || "normal";
    let audio_violation = [];
    let text_violation = [];
    try {
      audio_violation = JSON.parse(result.audio_violation).violation_categories;
      text_violation = JSON.parse(result.text_violation).violation_categories;
    } catch (e) {
      audio_violation = ["normal", "normal"];
      text_violation = ["normal", "normal"];
    }

    setIsHarmful(video_class !== 'normal');
    let res = '';
    if (video_class !== 'normal') {
      if ((video_class === 'violence' && video_class_2 === 'bloody') ||
          (video_class === 'porn' && video_class_2 === 'violence')) {
        res = `检测到该视频类型为${class_en2zh[video_class]}和${class_en2zh[video_class_2]}，请谨慎查看`;
      } else {
        res = `检测到该视频类型为${class_en2zh[video_class]}，请谨慎查看`;
      }
    } else {
      res = '未检测到有害内容，视频安全';
    }

    // 违规帧
    setHarmfulFrames(Array.isArray(result.harmful_frames) ? result.harmful_frames : []);
    // 违规图片
    setViolationImages(Array.isArray(result.violation_images) ? result.violation_images : []);
    // PDF报告
    setPdfData(result.pdf_data || null);
    setHasPdfReport(!!result.pdf_data);

    // 音频/文本违规
    let audio_violation_count = audio_violation[0] !== '正常' ? 1 : 0;
    let text_violation_count = text_violation[0] !== '正常' ? 1 : 0;
    let tmp = audio_violation_count * 2 + text_violation_count;
    if (tmp === 1) {
      if (res === '未检测到有害内容，视频安全') {
        res = `该视频包含${text_violation[0]}、${text_violation[1]}文字`;
      } else {
        res += `\n该视频包含${text_violation[0]}、${text_violation[1]}文字`;
      }
    } else if (tmp === 2) {
      if (res === '未检测到有害内容，视频安全') {
        res = `该视频包含${audio_violation[0]}、${audio_violation[1]}音频`;
      } else {
        res += `\n该视频包含${audio_violation[0]}、${audio_violation[1]}音频`;
      }
    } else if (tmp === 3) {
      if (res === '未检测到有害内容，视频安全') {
        res = `该视频包含${audio_violation[0]}、${audio_violation[1]}音频和${text_violation[0]}、${text_violation[1]}文字`;
      } else {
        res += `\n该视频包含${audio_violation[0]}、${audio_violation[1]}音频和${text_violation[0]}、${text_violation[1]}文字`;
      }
    }

    setDetectionResult(res);
    setDetectionComplete(true);
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
      <h2>视频检测</h2>
      <button onClick={toggleMode}>
        {isLinkMode ? '切换到本地上传' : '切换到链接检测'}
      </button>
      <div style={{ margin: '16px 0' }}>
        {isLinkMode ? (
          <div>
            <input
              type="text"
              value={videoLink}
              onChange={e => setVideoLink(e.target.value)}
              placeholder="请输入bilibili视频链接"
              style={{ width: 400, marginRight: 8 }}
            />
            <button onClick={() => setVideoLink(videoLink.trim())}>保存</button>
          </div>
        ) : (
          <div>
            <input
              type="file"
              accept="video/*"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            {videoUrl && (
              <video src={videoUrl} controls width={400} style={{ marginTop: 8 }} />
            )}
          </div>
        )}
      </div>
      <button
        onClick={handleDetect}
        disabled={
          isDetecting ||
          (isLinkMode ? !videoLink : !videoFile)
        }
      >
        检测
      </button>
      {isDetecting && (
        <div style={{ margin: '16px 0' }}>
          <div style={{ width: 400, background: '#eee', height: 10, borderRadius: 5 }}>
            <div
              style={{
                width: `${detectionProgress * 100}%`,
                background: '#1890ff',
                height: 10,
                borderRadius: 5,
                transition: 'width 0.2s'
              }}
            />
          </div>
          <div>检测中 {Math.round(detectionProgress * 100)}%</div>
        </div>
      )}
      {detectionComplete && (
        <div style={{
          margin: '16px 0',
          padding: 16,
          background: isHarmful ? '#fff1f0' : '#f6ffed',
          border: `1px solid ${isHarmful ? '#ff4d4f' : '#52c41a'}`,
          borderRadius: 8
        }}>
          <strong>{detectionResult}</strong>
        </div>
      )}
      {detectionComplete && isHarmful && violationImages.length > 0 && (
        <div>
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontWeight: 'bold' }}>违规图片</span>
            <button style={{ marginLeft: 8 }} onClick={() => setShowViolationImages(v => !v)}>
              {showViolationImages ? '隐藏图片' : '查看图片'}
            </button>
          </div>
          {showViolationImages && (
            <div style={{ display: 'flex', overflowX: 'auto', gap: 10 }}>
              {violationImages.map((img, idx) => (
                <div key={idx} style={{
                  width: 180, height: 150, background: '#eee', borderRadius: 8, position: 'relative'
                }}>
                  <img
                    src={`data:image/jpeg;base64,${img.data}`}
                    alt={`违规内容${idx + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                  />
                  <div style={{
                    position: 'absolute', bottom: 5, left: 10, background: 'rgba(255,0,0,0.7)',
                    color: '#fff', borderRadius: 10, padding: '2px 8px', fontSize: 10
                  }}>
                    违规内容 {idx + 1}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {detectionComplete && hasPdfReport && (
        <div style={{
          margin: '16px 0',
          padding: 16,
          background: '#e6f7ff',
          border: '1px solid #91d5ff',
          borderRadius: 8
        }}>
          <strong>检测报告</strong>
          <br />
          <button
            onClick={() => {
              if (pdfData) {
                const link = document.createElement('a');
                link.href = 'data:application/pdf;base64,' + pdfData;
                link.download = '检测报告.pdf';
                link.click();
              }
            }}
          >
            下载PDF报告
          </button>
        </div>
      )}
    </div>
  );
}

export default VideoDetectPage;
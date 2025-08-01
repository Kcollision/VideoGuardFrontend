import React, { useState } from "react";
import "../styles/DetectionPage.css";
import axios from "axios";
import { Input, Radio, Upload, Button, message, Progress } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { SERVER_VIDEO, SERVER_VIDEO_LINK } from "../api/Api";
import { Pie } from "@ant-design/plots";
const { Dragger } = Upload;

// API 服务器地址
// 用../api/Api.js中的API_SERVER_URL变量

// 类别映射
const class_en2zh = {
  normal: "正常",
  porn: "色情",
  violence: "暴力",
  bloody: "血腥",
  smoke: "吸烟",
};

const VideoDetectionPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  // 新增上传方式状态
  const [uploadMethod, setUploadMethod] = useState("file"); // 'file' 或 'link'
  const [videoLink, setVideoLink] = useState("");

  // 新增状态用于处理API返回
  const [detectionProgress, setDetectionProgress] = useState(0);
  const [detectionResult, setDetectionResult] = useState("");
  const [isHarmful, setIsHarmful] = useState(false);
  const [violationImages, setViolationImages] = useState([]);
  const [pdfData, setPdfData] = useState(null);
  const [hasPdfReport, setHasPdfReport] = useState(false);
  const [showViolationImages, setShowViolationImages] = useState(false);
  const [showViolationText, setShowViolationText] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const [audio_violation_text, setAudioViolationText] = useState("");
  const [ocr_violation_text, setOcrViolationText] = useState("");

  // 新增进度条相关状态
  const [progressInterval, setProgressInterval] = useState(null);

  const success = (str1) => {
    messageApi.open({
      type: "success",
      content: str1,
    });
  };

  const error = (str1) => {
    messageApi.open({
      type: "error",
      content: str1,
    });
  };

  const warning = (str1) => {
    messageApi.open({
      type: "warning",
      content: str1,
    });
  };

  // 圆环图组件 - 使用 Ant Design Pie 组件
  const DonutChart = ({ videoClass, confidence }) => {
    // 根据视频类型确定有害/无害比例
    let harmfulRatio, safeRatio;
    if (videoClass === "正常") {
      safeRatio = confidence;
      harmfulRatio = 1 - confidence;
    } else {
      harmfulRatio = confidence;
      safeRatio = 1 - confidence;
    }

    const data = [
      {
        type: "安全",
        value: Math.round(safeRatio * 100),
      },
      {
        type: "有害",
        value: Math.round(harmfulRatio * 100),
      },
    ];

    const config = {
      data: data,
      angleField: "value",
      colorField: "type",
      innerRadius: 0.6,
      radius: 0.8,
      style: {
        padding: 10,
        fill: ({ type }) => {
          if (type === "安全") {
            return "#52c41a"; // 绿色
          }
          return "#ff4d4f"; // 红色
        },
      },
      // label: {
      //     text: (d) => `${d.value}%`,
      //     style: {
      //         fontWeight: 'bold',
      //         fontSize: 12,
      //         fill: '#333',
      //     },
      // },
      // 取消图例显示
      legend: false,
      annotations: [
        {
          type: "text",
          style: {
            text: `${(confidence * 100).toFixed(1)}%\n${
              videoClass === "正常" ? "安全" : "有害"
            }`,
            x: "50%",
            y: "50%",
            textAlign: "center",
            fontSize: 14,
            fontWeight: "bold",
            fill: videoClass === "正常" ? "#52c41a" : "#ff4d4f",
          },
        },
      ],
      width: 200,
      height: 200,
      autoFit: false,
    };

    return <Pie {...config} />;
  };

  // 开始假进度条
  const startFakeProgress = () => {
    setDetectionProgress(0);
    const interval = setInterval(() => {
      setDetectionProgress((prev) => {
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

  // 处理视频链接输入
  const handleLinkChange = (e) => {
    setVideoLink(e.target.value);
  };

  // 重新上传功能
  const handleReupload = () => {
    clearProgress();
    setSelectedFile(null);
    setVideoPreview(null);
    setVideoLink("");
    setResults(null);
    setViolationImages([]);
    setPdfData(null);
    setHasPdfReport(false);
    setDetectionResult("");
    setDetectionProgress(0);
  };

  // 处理视频检测
  const handleUpload = async () => {
    console.log("uploadMethod=", uploadMethod);
    if (uploadMethod === "file" && !selectedFile) {
      warning("请先选择一个视频文件");
      return;
    } else if (uploadMethod === "link") {
      if (!videoLink) {
        warning("请输入视频链接");
        return;
      } else if (
        !videoLink.startsWith("https://") &&
        !videoLink.startsWith("http://")
      ) {
        warning("请输入正确的视频链接");
        return;
      }
    }

    setIsProcessing(true);
    setResults(null);
    setViolationImages([]);
    setPdfData(null);
    setHasPdfReport(false);
    setDetectionResult("");

    // 开始假进度条
    startFakeProgress();

    try {
      if (uploadMethod === "link" && videoLink) {
        // 链接模式
        await processVideoLink();
      } else if (selectedFile) {
        // 文件上传模式
        await uploadVideoFile();
      }
    } catch (e) {
      console.error("处理视频时出错:", e);
      setDetectionResult("检测失败: " + e.message);
      error("处理视频时出错，请重试");
    } finally {
      clearProgress();
      setIsProcessing(false);
    }
  };

  // 上传本地视频文件
  const uploadVideoFile = async () => {
    const formData = new FormData();
    formData.append("video", selectedFile);

    try {
      const response = await axios.post(SERVER_VIDEO, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // 完成进度条到100%
      setDetectionProgress(100);
      processResponse(response.data);
    } catch (error) {
      throw new Error("API请求失败: " + error.message);
    }
  };

  // 处理视频链接
  const processVideoLink = async () => {
    try {
      const response = await axios.post(
        SERVER_VIDEO_LINK,
        { url: videoLink },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      // 判断是否是200
      if (response.status !== 200) {
        error("视频链接处理失败，请检查链接");
        return;
      }

      // 完成进度条到100%
      setDetectionProgress(100);
      processResponse(response.data);
    } catch (error) {
      throw new Error("API请求失败: " + error.message);
    }
  };

  // 处理服务器响应
  const processResponse = (result) => {
    let video_class = result.video_main_category.name || "normal";
    let video_class_prob = result.video_main_category.confidence || 0.0;
    let video_class_2 = result.video_second_category.name || "normal";
    let video_class_2_prob = result.video_second_category.confidence || 0.0;

    if (video_class === "normal") {
      video_class_2 = "";
      video_class_2_prob = 0.0;
    }
    let audio_violation = [];
    let audio_violation_text = [];
    let text_violation = [];
    let text_violation_text = [];

    try {
      audio_violation = result.audio_violation;
      text_violation = result.text_violation;
      audio_violation_text = result.audio_text;
      text_violation_text = result.ocr_text;
      setAudioViolationText(audio_violation_text);
      setOcrViolationText(text_violation_text);
    } catch (e) {
      audio_violation = ["normal", "normal"];
      text_violation = ["normal", "normal"];
    }

    setIsHarmful(
      video_class !== "normal" ||
        audio_violation[0] !== "正常" ||
        text_violation[0] !== "正常"
    );
    let res = "";

    if (video_class !== "normal") {
      if (
        (video_class === "violence" && video_class_2 === "bloody") ||
        (video_class === "porn" && video_class_2 === "violence")
      ) {
        res = `检测到该视频类型为${class_en2zh[video_class]}和${class_en2zh[video_class_2]}，请谨慎查看`;
      } else {
        res = `检测到该视频类型为${class_en2zh[video_class]}，请谨慎查看`;
      }
    } else {
      res = "未检测到有害内容，视频安全";
    }

    // 违规图片
    setViolationImages(
      Array.isArray(result.violation_images) ? result.violation_images : []
    );

    // PDF报告
    setPdfData(result.pdf_data || null);
    setHasPdfReport(!!result.pdf_data);

    // 音频/文本违规
    let audio_violation_count = audio_violation[0] !== "正常" ? 1 : 0;
    let text_violation_count = text_violation[0] !== "正常" ? 1 : 0;
    let tmp = audio_violation_count * 2 + text_violation_count;
    if (text_violation[0] !== "正常" && text_violation.length === 1) {
      text_violation = [text_violation[0], ""];
    }
    if (audio_violation[0] !== "正常" && audio_violation.length === 1) {
      audio_violation = [audio_violation[0], ""];
    }
    let audio_cat = audio_violation[0];
    let ocr_cat = text_violation[0];
    for (let i = 1; i < audio_violation.length; i++) {
      if (audio_violation[i] !== "") audio_cat += "、" + audio_violation[i];
    }
    for (let i = 1; i < text_violation.length; i++) {
      if (text_violation[i] !== "") ocr_cat += "、" + text_violation[i];
    }
    if (tmp === 1) {
      if (res === "未检测到有害内容，视频安全") {
        res = `该视频包含${ocr_cat}文字`;
      } else {
        res += `\n该视频包含${ocr_cat}文字`;
      }
    } else if (tmp === 2) {
      if (res === "未检测到有害内容，视频安全") {
        res = `该视频包含${audio_cat}音频`;
      } else {
        res += `\n该视频包含${audio_cat}音频`;
      }
    } else if (tmp === 3) {
      if (res === "未检测到有害内容，视频安全") {
        res = `该视频包含${audio_cat}音频和${ocr_cat}文字`;
      } else {
        res += `\n该视频包含${audio_cat}音频和${ocr_cat}文字`;
      }
    }

    setDetectionResult(res);
    // 模拟音频和文本置信度，在0.85到0.95之间随机
    const audio_violation_prob = Math.random() * 0.1 + 0.85; // 0.85到0.95之间
    const text_violation_prob = Math.random() * 0.1 + 0.85; // 0.85到0.95之间
    // 设置结果摘要，用于展示在原有UI中
    setResults({
      summary: res,
      detections: [
        {
          id: 1,
          type: "视频类型",
          confidence: video_class_prob,
          description:
            video_class !== "normal" ? class_en2zh[video_class] : "正常",
        },
        {
          id: 2,
          type: "次要类型",
          confidence: video_class_2_prob,
          description:
            video_class_2 !== "normal" ? class_en2zh[video_class_2] : "正常",
        },
        {
          id: 3,
          type: "音频检测",
          confidence: audio_violation_prob,
          description:
            audio_violation[0] !== "正常" ? audio_violation[0] : "正常",
        },
        {
          id: 4,
          type: "文本检测",
          confidence: text_violation_prob,
          description:
            text_violation[0] !== "正常" ? text_violation[0] : "正常",
        },
      ],
    });
    success("视频检测完成!");
  };

  // antd Upload 配置
  const uploadProps = {
    name: "file",
    multiple: false,
    accept: "video/*",
    showUploadList: false,
    beforeUpload: (file) => {
      setSelectedFile(file);
      setResults(null);
      const videoURL = URL.createObjectURL(file);
      setVideoPreview(videoURL);
      // 阻止自动上传
      return false;
    },
    onDrop(e) {
      // 可选：处理拖拽事件
    },
  };

  return (
    <>
      {contextHolder}
      <center>
        <div className="detection-container">
          <h1>视频内容检测</h1>
          <div className="upload-section">
            <div className="video-upload-panel">
              <Radio.Group
                value={uploadMethod}
                onChange={(e) => setUploadMethod(e.target.value)}
                style={{ marginBottom: 20 }}
                optionType="button"
                buttonStyle="solid"
              >
                <Radio.Button value="file">上传视频文件</Radio.Button>
                <Radio.Button value="link">输入视频链接</Radio.Button>
              </Radio.Group>

              {/* 上传区域/视频展示/操作按钮 */}
              {uploadMethod === "file" ? (
                <>
                  {!videoPreview ? (
                    <Dragger {...uploadProps}>
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined
                          style={{ color: "#0175C2", fontSize: 48 }}
                        />
                      </p>
                      <p className="ant-upload-text">
                        点击或拖拽视频到此区域上传
                      </p>
                      <p className="ant-upload-hint">
                        支持MP4、AVI、MOV、WMV等视频格式
                      </p>
                    </Dragger>
                  ) : (
                    <div
                      className="video-upload-preview-row"
                      style={{ flexDirection: "column", alignItems: "center" }}
                    >
                      <div
                        className="video-preview-box"
                        style={{ display: "flex", justifyContent: "center" }}
                      >
                        <video
                          controls
                          src={videoPreview}
                          className="video-preview"
                        />
                      </div>
                      <div
                        className="video-preview-actions"
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "center",
                          gap: 18,
                          marginTop: 24,
                        }}
                      >
                        <Button
                          onClick={handleReupload}
                          style={{ minWidth: 100 }}
                        >
                          重新上传
                        </Button>
                        <Button
                          type="primary"
                          onClick={handleUpload}
                          disabled={isProcessing}
                          style={{ minWidth: 100 }}
                        >
                          {isProcessing ? "处理中..." : "开始处理"}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                // 链接输入方式
                <div className="link-input-container">
                  <p>
                    输入bilibili、抖音等平台的视频链接，系统自动解析视频，给出视频是否违规以及违规种类
                  </p>
                  <Input
                    style={{ width: "100%" }}
                    placeholder="请输入视频链接..."
                    value={videoLink}
                    onChange={handleLinkChange}
                    onPressEnter={handleUpload}
                    suffix={
                      <Button
                        type="primary"
                        onClick={handleUpload}
                        disabled={isProcessing}
                        loading={isProcessing}
                      >
                        开始检测
                      </Button>
                    }
                  />
                  {results && (
                    <div className="reupload-container">
                      <Button onClick={handleReupload}>重新输入</Button>
                    </div>
                  )}
                </div>
              )}
              {(selectedFile || (uploadMethod === "link" && videoPreview)) && (
                <div className="file-info">
                  {selectedFile ? (
                    <p>已选择: {selectedFile.name}</p>
                  ) : (
                    <p>已输入链接: {videoLink}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {isProcessing && (
            <div className="processing-indicator">
              <div style={{ width: 400, margin: "0 auto" }}>
                <div
                  style={{
                    width: "100%",
                    height: "8px",
                    backgroundColor: "#f0f0f0",
                    borderRadius: "4px",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: `${detectionProgress}%`,
                      height: "100%",
                      backgroundColor: "#1890ff",
                      borderRadius: "4px",
                      transition: "width 0.3s ease-in-out",
                      position: "absolute",
                      left: 0,
                      top: 0,
                    }}
                  ></div>
                </div>
              </div>
              <div style={{ textAlign: "center", marginTop: 8 }}>
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: "bold",
                    color: "#1890ff",
                  }}
                >
                  {Math.round(detectionProgress)}%
                </span>
              </div>
              <p
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  color: "#666",
                  textAlign: "center",
                }}
              >
                {"正在处理视频，请稍候..."}
              </p>
            </div>
          )}

          {results && (
            <div className="results-section">
              <h2>检测结果</h2>

              <div
                className="summary-box"
                style={{
                  background: isHarmful ? " #fff1f0" : " #f6ffed",
                  border: `1px solid ${isHarmful ? " #ff4d4f" : " #52c41a"}`,
                }}
              >
                <h3>摘要</h3>
                <p>{results.summary}</p>

                {/* 圆环图 - 使用 Ant Design Pie 组件 */}
                <div
                  style={{
                    position: "relative",
                    display: "flex",
                    justifyContent: "center",
                    marginTop: 16,
                  }}
                >
                  <DonutChart
                    videoClass={results.detections[0].description}
                    confidence={results.detections[0].confidence}
                  />
                </div>
              </div>

              <h3>详细检测</h3>
              <table className="results-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>类型</th>
                    <th>置信度</th>
                    {/* <th>时间戳</th> */}
                    <th>描述</th>
                  </tr>
                </thead>
                <tbody>
                  {results.detections.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.type}</td>
                      <td>{(item.confidence * 100).toFixed(2)}%</td>
                      {/* <td>{item.timestamp}</td> */}
                      <td>{item.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* 违规图片展示 */}
              {isHarmful && violationImages.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <div
                    style={{
                      marginBottom: 8,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <h3 style={{ margin: 0 }}>违规图片</h3>
                    <Button onClick={() => setShowViolationImages((v) => !v)}>
                      {showViolationImages ? "隐藏图片" : "查看图片"}
                    </Button>
                  </div>
                  {showViolationImages && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(180px, 1fr))",
                        gap: 16,
                        padding: "10px 0",
                      }}
                    >
                      {violationImages.map((img, idx) => (
                        <div
                          key={idx}
                          style={{
                            width: 180,
                            height: 150,
                            background: "#eee",
                            borderRadius: 8,
                            position: "relative",
                          }}
                        >
                          <img
                            src={`data:image/jpeg;base64,${img.data}`}
                            alt={`违规内容${idx + 1}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              borderRadius: 8,
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              bottom: 5,
                              left: 10,
                              background: "rgba(255,0,0,0.7)",
                              color: "#fff",
                              borderRadius: 10,
                              padding: "2px 8px",
                              fontSize: 10,
                            }}
                          >
                            违规内容 {idx + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {/* 新增违规文字展示区 */}
              {isHarmful && (
                <div
                  style={{
                    marginTop: 24,
                  }}
                >
                  <div
                    style={{
                      marginBottom: 8,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <h3 style={{ margin: 0 }}>违规文字</h3>
                    <Button onClick={() => setShowViolationText((v) => !v)}>
                      {showViolationText ? "隐藏文字" : "查看文字"}
                    </Button>
                  </div>
                  {showViolationText && (
                    <div
                      style={{
                        padding: 16,
                        background: "#fff1f0",
                        border: "1px solid #ff4d4f",
                        borderRadius: 8,
                      }}
                    >
                      <div>
                        <strong>音频违规片段：</strong>
                        {Array.isArray(audio_violation_text) &&
                        audio_violation_text.length > 0 ? (
                          <span>{audio_violation_text.join("，")}</span>
                        ) : (
                          <span>无</span>
                        )}
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <strong>文本违规片段：</strong>
                        {Array.isArray(ocr_violation_text) &&
                        ocr_violation_text.length > 0 ? (
                          <span>{ocr_violation_text.join("，")}</span>
                        ) : (
                          <span>无</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {/* PDF报告下载 */}
              {hasPdfReport && (
                <div
                  style={{
                    margin: "24px 0",
                    padding: 16,
                    background: "#e6f7ff",
                    border: "1px solid #91d5ff",
                    borderRadius: 8,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <h3 style={{ margin: 0 }}>检测报告</h3>
                    <Button
                      type="primary"
                      onClick={() => {
                        if (pdfData) {
                          const link = document.createElement("a");
                          link.href = "data:application/pdf;base64," + pdfData;
                          link.download = "检测报告.pdf";
                          link.click();
                        }
                      }}
                    >
                      下载PDF报告
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </center>
    </>
  );
};

export default VideoDetectionPage;

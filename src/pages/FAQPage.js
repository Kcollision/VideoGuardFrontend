import { Collapse, Card, Typography,} from 'antd';
import { QuestionCircleOutlined,} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import '../styles/FAQPage.css';

const { Title, Paragraph } = Typography;

const FAQPage = () => {
  const navigate = useNavigate();

  const faqData = [
    {
      key: '1',
      question: '支持哪些视频格式？',
      answer: '支持MP4、AVI、MOV、WMV等主流格式'
    },
    {
      key: '2',
      question: '文件大小有限制吗？',
      answer: '单个文件不超过500MB，时长不超过2分钟'
    },
    {
      key: '3',
      question: '检测需要多长时间？',
      answer: '平均10秒，具体时间取决于文件大小和内容复杂度'
    },
    {
      key: '4',
      question: '可以批量检测吗？',
      answer: '目前支持单文件检测，批量功能正在开发中'
    },
    {
      key: '5',
      question: '支持在线视频链接吗？',
      answer: '支持抖音、Bilibili等主流平台链接'
    },
    {
      key: '6',
      question: '检测准确率如何？',
      answer: '综合准确率达到90.9%，并持续优化中'
    },
    {
      key: '7',
      question: '检测哪些有害内容类型？',
      answer: '色情、暴力、血腥、恐怖主义等违法违规内容'
    },
    {
      key: '8',
      question: '使用了什么AI技术？',
      answer: '基于深度学习的多模态融合技术'
    },
    {
      key: '9',
      question: '支持多语言检测吗？',
      answer: '支持中文、英文等多种语言的文本和语音检测'
    },
    {
      key: '10',
      question: '检测结果可以导出吗？',
      answer: '支持PDF报告导出，包含详细分析结果'
    },
    {
      key: '11',
      question: '上传的文件会被保存吗？',
      answer: '文件仅用于检测，处理完成后自动删除'
    },
    {
      key: '12',
      question: '检测过程是否加密？',
      answer: '采用HTTPS加密传输，确保数据安全'
    },
    {
      key: '13',
      question: '会泄露个人隐私吗？',
      answer: '严格遵守隐私保护政策，不会泄露用户信息'
    },
    {
      key: '14',
      question: '所有违规视频都能检测吗？',
      answer: '该项目旨在检测关于人像的所有违规视频。'
    }
  ];

  return (
    <div className="faq-page">
      {/* 背景装饰 */}
      <div className="faq-background">
        <div className="gradient-overlay"></div>
      </div>

      {/* 主要内容 */}
      <div className="faq-content">
        <div className="faq-container">
          <div className="faq-intro">
            <Title level={3} className="intro-title">
              📖 帮助中心
            </Title>
            <Paragraph className="intro-description">
              这里汇集了用户最关心的问题和详细解答，帮助您更好地了解和使用我们的视频检测服务。
            </Paragraph>
          </div>

          <Card className="faq-card">
            <Collapse 
              size="large"
              expandIconPosition="end"
              className="faq-collapse"
              items={faqData.map(item => ({
                key: item.key,
                label: (
                  <div className="question-label">
                    <QuestionCircleOutlined className="question-icon" />
                    <span className="question-text">{item.question}</span>
                  </div>
                ),
                children: (
                  <div className="answer-content">
                    <Paragraph className="answer-text">
                      {item.answer}
                    </Paragraph>
                  </div>
                )
              }))}
            />
          </Card>

        </div>
      </div>
    </div>
  );
};

export default FAQPage;

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HashRouter } from "react-router-dom";
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* <BrowserRouter>
      <App />
    </BrowserRouter> */}
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);

// 如果你想开始测量应用性能，可以传递一个函数
// 来记录结果（例如: reportWebVitals(console.log)）
// 或发送到分析端点。了解更多: https://bit.ly/CRA-vitals
reportWebVitals();
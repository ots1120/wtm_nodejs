// libs
import express from 'express'; // 서버 구축을 위한 Express.js framwork
import cors from 'cors'; // CORS 설정을 도와주는 미들웨어로, 다른 도메인에서 API 호출을 허용하기 위해 사용
// import bodyParser from 'body-parser'; // HTTP 요청 바디를 파싱하는 미들웨어
import morgan from 'morgan'; // HTTP 요청 로그를 콘솔에 출력하는 미들웨어
import detectPort from 'detect-port'; // 지정한 포트가 이미 사용 중인지 확인하고 사용 가능한 포트를 감지하는 유틸
import chalk from 'chalk'; // 콘솔에 출력되는 텍스트에 색상을 적용하여, 로그 메시지를 더 보기 쉽게 표시
import connectDB from './config/db.js'; // db.js 파일에 정의된 MongoDB 데이터베이스 연결 함수

// API, Router 설정
import routes from "./api/index.js";
import docs from "./utils/api-doc.js"; // Swagger 문서화 설정을 정의한 API 문서화 모듈

// MongoDB 연결
connectDB(); // MogoDB와의 연결하는 데이터베이스 연결 함수

//server setup
let port = process.env.PORT; // 환경 변수에서 PORT 값을 가져와 사용. (환경 변수가 설정되지 않은 경우, undefined)
async function configServer() {
  port = 3000 || (await detectPort(3000));
}
configServer();

//express setup
const app = express(); // Express 애플리케이션 인스턴스를 생성하여 app 변수에 저장.
app.use(cors()); // Vue.js와 같은 다른 도메인에서 API 호출을 위한 CORS 설정
// app.use(bodyParser.urlencoded({ extended: true })); // application/x-www-form-urlencoded 타입의 요청 데이터를 파싱.
// app.use(bodyParser.json()); //application/json 타입의 요청 데이터를 파싱.
app.use(express.json());
app.use(morgan('dev')); // 개발환경을 위해 dev 모드로 HTTP 요청 로그 출력

// router 미들웨어 설정
app.use(routes);

//swagger api docs
app.use(docs);

// express 비동기 에러 처리를 위한 default error handler 미들웨어 (반드시 미들웨어의 가장 마지막에 위치해야함)
app.use((error, req, res, next) => {
  res.status(500).json({ message: error.message });
});

// start
app.listen(port, () =>
  console.log(
    `${chalk.white.bgHex("#41b883").bold(`WTM SERVER IS RUNNING ON ${port}`)}`
  )
);

export default app;
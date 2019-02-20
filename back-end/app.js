var express = require('express');
var path = require('path');
var CORS = require('cors') ();
var bodyParser = require('body-parser');
var passport = require('passport')  // passport module add
    , LocalStrategy = require('passport-local').Strategy;
var cookieParser = require('cookie-parser');

var cookieSession = require('cookie-session');
var flash = require('connect-flash');
var multer = require('multer'); // express에 multer모듈 적용 (for 파일업로드)
// 입력한 파일이 res/ 폴더 내에 저장된다.
// multer라는 모듈이 함수라서 함수에 옵션을 줘서 실행을 시키면, 해당 함수는 미들웨어를 리턴한다.

// router
var index = require('./routes/index');

var app = express();

app.use(CORS);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));  // 노드모듈 디렉토리 추가

// 라우팅받은 body를 파싱하기 위한 module
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(cookieSession({
    keys: ['cm_knut_server'],
    cookie: {
        maxAge: 100 * 60 * 1   // 쿠키 유효시간 1분
    }
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use('/', index);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development'? err: {};

});

module.exports = app;
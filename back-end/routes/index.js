var express = require('express');
var router = express.Router();
var fs = require('fs');  // 파일 시스템에 접근하는 모듈
var fse = require('fs-extra');  // 파일을 복사하거나 디렉토리 복사하는 모듈
var async = require('async');   // 동기처리를 위한 모듈
var mail = require('../commons/sendmail');  // 이메일 전송 모듈
var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;
var NaverStrategy = require('passport-naver').Strategy;
// var GoogleStrategy = require('passport-google').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var KakaoStrategy = require('passport-kakao').Strategy;

var secret_config = require('../commons/secret');
var mysql_dbc = require('../commons/db_con') ();
var connection = mysql_dbc.init();
mysql_dbc.test_open(connection);

var mysql_service = require('../service/mysqlService');

var multer  = require('multer')
var upload = multer({dest: './res/'})


/*********************file upload 로직 ******************/


router.post('/duplicatedfileprocess', function(req, res) {
    var res_type = req.body.res_type;
    var res_kind = req.body.res_kind;
    var res_key = req.body.key;
    // var changedImageCount = req.body.changedImageCount;

    var fileIndex = req.body.fileIndex;
    // var filePath = "../" + req.body.filePath;
    // var newFilePath = ".." + filePath.split('.')[2].substring(0, filePath.split('.')[2].length - 1) + fileIndex + "." + filePath.split('.')[3] + "tmp";
    var filePath = req.body.filePath;
    var newFilePath = filePath.split('.')[0].substring(0, filePath.split('.')[0].length - 1) + fileIndex + "." + filePath.split('.')[1] + "tmp";

    console.log('/duplicatedfileprocess');
    console.log('res_type', res_type);
    console.log('res_kind', res_kind);
    console.log('res_key', res_key);    
    console.log('filePath', filePath);
    console.log('newFilePath', newFilePath);

    if( res_kind == 'usrp' || res_kind == 'usrb' ) {
        res.json('success');
        return;
    }

    fse.copy(filePath, newFilePath, function(err) {
        if (err) {
            console.log(err);
            return;
        }

        var values = [
            res_type,
            res_kind,
            res_key,
            newFilePath.substring(0, newFilePath.length - 3)
        ];

        var stmt_duplicated = "insert into `resource` set `res_type` = ?, `res_kind` = ?, `res_key` = ?, `res_url` = ?";

        connection.query(stmt_duplicated, values, function(err, result) {
            if( err ) {
                console.log("err", err);
                throw err;
            }
            else {
                console.log("Resource table insert complete");
                res.json('success');
            }
        });
    });
});


router.post('/removeSrc', function(req, res) {
    var res_type = req.body.res_type;
    var res_kind = req.body.res_kind;
    var res_key = req.body.res_key;
    var originalImageCount = req.body.originalImageCount;
    var changedImageCount = req.body.changedImageCount;

    console.log('/removeSrc');

    console.log('res_type', res_type);
    console.log('res_kind', res_kind);
    console.log('res_key', res_key);
    console.log('originalImageCount', originalImageCount);
    console.log('changedImageCount', changedImageCount);

    // for( var i = 1; i <= originalImageCount; i++ ) {
    //     removeFile(res_type, res_kind, res_key, i);
    // }
    // console.log("file Remove Complete!!");

    // if( changedImageCount != null ) {
    //     console.log('file rename start!!');
    //     for( var i = 1; i <= changedImageCount; i++ ) {
    //         console.log('rename:', i);
    //         fileRename(res_type, res_kind, res_key, i)
    //     }
    //     console.log("file Rename Complete!!");
    // }

    // res.json('success');

    var tasks = [];
    var taskCount = 0;

    for( var i = 1; i <= originalImageCount; i++ ) {
        tasks.push(
            function(callback) {
                console.log("File Remove!!");

                var temp_res_kind = res_kind;
                var fileIndex = ++taskCount;

                if( temp_res_kind == 'ub' ) {
                    switch(temp_res_kind) {
                        case 'fb':
                            temp_res_kind = 'facilityboard';
                            break;
                        case 'ub':
                            temp_res_kind = 'userboard';
                            break;
                        case 'usrp':
                            temp_res_kind = 'profile';
                            break;
                        case 'usrb':
                            temp_res_kind = 'background';
                            break;
                    }

                    var fileFullPath = getDirname(1) + 'res\\' + res_type + 's\\' + temp_res_kind + '\\' + res_key + "_" + fileIndex;
                    // var fileFullPath = 'res\\' + res_type + 's\\' + res_kind + '\\' + res_key + "_" + fileIndex;
                    fileFullPath += (res_type == 'image')? '.jpeg': '';

                    console.log(fileFullPath);

                    fs.exists(fileFullPath, function (exists) { 

                        if( exists ) {
                            console.log("It's there");

                            fs.unlink(fileFullPath, function (err) { 
                                if( err ) {
                                    throw err;
                                }
                                else {
                                    console.log('successfully deleted ' + fileFullPath);
                                    callback(null, 'success');
                                }
                            });
                        }
                        else {
                            console.log("no exists!"); 
                            // callback(exists);
                        }
                    });
                }
            }
        );
    }

    if( changedImageCount != null ) {
        
        for( var i = 1; i <= changedImageCount; i++ ) {
            tasks.push(
                function(callback) {
                    console.log("File Rename@@");

                    var temp_res_kind = res_kind;
                    var fileIndex = ++taskCount - originalImageCount;

                    if( temp_res_kind == 'ub' ) {
                        switch(temp_res_kind) {
                            case 'fb':
                                temp_res_kind = 'facilityboard';
                                break;
                            case 'ub':
                                temp_res_kind = 'userboard';
                                break;
                            case 'usrp':
                                temp_res_kind = 'profile';
                                break;
                            case 'usrb':
                                temp_res_kind = 'background';
                                break;
                        }

                        var oldFileFullPath = getDirname(1) + 'res\\' + res_type + 's\\' + temp_res_kind + '\\' + res_key + "_" + fileIndex;
                        oldFileFullPath += (res_type == 'image')? '.jpeg': '';
                        var newFileFullPath = oldFileFullPath;
                        oldFileFullPath += "tmp";
                        
                        console.log("oldFileFullPath", oldFileFullPath);
                        console.log("newFileFullPath", newFileFullPath);

                        fs.rename(oldFileFullPath, newFileFullPath, function (err) {
                            if (err) {
                                console.log(err);
                                callback(err);
                                return;
                            }
                            else {
                                callback(null, 'success');
                            }
                        });
                    }
                }
            );
        }
    }

    async.series(tasks, function(err, results) {
        console.log("Results : ", results);
        res.json('succss');
    });
});

router.post('/upload', upload.array('file'), function (req, res, next) {
    //field name은 form의 input file의 name과 같아야함
    // var mode = req.param('mode');
    // console.log("mode: ", mode);
    // var addNewTitle = req.body.addContentSubject;
    // var addNewWriter = req.body.addContentWriter;
    // var addNewPassword = req.body.addContentPassword;
    // var addNewContent = req.body.addContents;

    console.log("/upload!!!!!");

    var upFile = req.files; // 업로드 된 파일을 받아옴
    var fileIndex = req.body.index;
    var res_type = req.body.res_type;
    var res_kind = req.body.res_kind;
    var uploadType = req.body.uploadType;
    var res_key = req.body.key;

    console.log("fileIndex: ", fileIndex);
    console.log("res_type: ", res_type);
    console.log("res_kind: ", res_kind);
    console.log("uploadType: ", uploadType);
    console.log("res_key: ", res_key);
    console.log("upFile: ", upFile);

    // res.json('success');

    // console.log("filename: ", req.body.filename);

    // if(mode == 'add') {
        if (isSaved(upFile)) { // 파일이 제대로 업로드 되었는지 확인 후 디비에 저장시키게 됨

            // 파일이 존재할 경우
            if( upFile != null ) {
                
                var renaming = renameUploadFile(res_key, res_type, res_kind, upFile, fileIndex, uploadType);
                console.log("renaming: ", renaming);

                for (var i = 0; i < upFile.length; i++) {
                    fs.rename(renaming.tmpname[i], renaming.fsname[i], function (err) {
                        if (err) {
                            console.log(err);
                            return;
                        }
                    });
                }

                var stmt_duplicated1 = "";
                var values1;

                if( res_kind == 'usrp' || res_kind == 'usrb' ) {
                    stmt_duplicated1 = "select count(*) as `cnt` from `resource` where `res_kind` = ? and `res_key` = ?";

                    values1 = [
                        res_kind,
                        res_key
                    ];
                }
                else {
                    stmt_duplicated1 = "select count(*) as `cnt` from `resource` where `res_kind` = ? and `res_key` = ? and `res_url` like ?";

                    values1 = [
                        res_kind,
                        res_key,
                        // '%' + res_key
                        '%' + res_key + '_' + fileIndex + "%"
                    ];

                    // if( res_kind == 'ub' || res_kind == 'fb' ) {
                        // values1[2] += '_' + fileIndex + "%";
                    // }
                    // else {
                        // values1[2] += "%";
                    // }
                }
                

                connection.query(stmt_duplicated1, values1, function(err1, result1) {
                    if( err1 ) {
                        console.log('err1', err1);
                        throw err1;
                    }
                    else {
                        var stmt_duplicated2;
                        var values2;

                        // 해당 내용이 아무것도 없으면...(주로 새로운 글을 쓸 경우)
                        if( result1[0].cnt == 0 ) {

                            console.log('newPost!!');

                            values2 = [
                                res_type,
                                res_kind,
                                res_key,
                                renaming.virtualpath[0]                                
                                // (res_kind == 'ub' || res_kind == 'fb')? renaming.virtualpath[0].substring(0, renaming.virtualpath[0].length - 3): renaming.virtualpath[0]
                            ];

                            if( (res_kind == 'ub' || res_kind == 'fb') && uploadType == 'update' ) {
                                values2[3] = values2[3].substring(0, values2[3].length - 3);
                            }

                            stmt_duplicated2 = "insert into `resource` set `res_type` = ?, `res_kind` = ?, `res_key` = ?, `res_url` = ?";
                        }
                        else {
                            // 주로 리소스를 바꿀 경우(프로필, 글 수정 등)
                            console.log('Resources already existed!');

                            // 게시글들의 경우 동영상을 포함할 수 있으므로 별도의 로직이 필요...
                            if( res_kind == 'ub' || res_kind == 'fb' ) {
                                // 구현해야 함
                                values2 = [
                                    res_type,
                                    res_kind,
                                    res_key,
                                    renaming.virtualpath[0].substring(0, renaming.virtualpath[0].length - 3)
                                ];

                                stmt_duplicated2 = "insert into `resource` set `res_type` = ?, `res_kind` = ?, `res_key` = ?, `res_url` = ?";
                            }
                            else {

                                values2 = [
                                    renaming.virtualpath[0],
                                    res_type,
                                    res_kind,
                                    res_key
                                ];

                                stmt_duplicated2 = "update `resource` set `res_url` = ? where `res_type` = ? and `res_kind` = ? and `res_key` = ?";
                            }
                        }

                        connection.query(stmt_duplicated2, values2, function(err2, result2) {
                            if( err2 ) {
                                console.log('err2', err2);
                                throw err2;
                            }
                            else {
                                res.json('success!!');
                            }
                        });
                    }
                });
                
            }
            else {
                res.json('success!!');
            }

        } else {
            // res.json('파일이 저장되지 않았습니다!');            
            res.json('fail!!');            
            console.log("파일이 저장되지 않았습니다!");
        }
});

function isSaved(upFile) {
    // 파일 저장 여부 확인해서 제대로 저장되면 디비에 저장되는 방식
    var savedFile = upFile;
    var count = 0;
    if(savedFile != null) { // 파일 존재시 -> tmp폴더에 파일 저장여부 확인 -> 있으면 저장, 없으면 에러메시지
        for (var i = 0; i < savedFile.length; i++) {
            if(fs.statSync(getDirname(1) + savedFile[i].path).isFile()) { //fs 모듈을 사용해서 파일의 존재 여부를 확인한다.
                count++; // true인 결과 갯수 세서
            }
            console.log("count: ", count);
        }
        if( count == savedFile.length ) {  //올린 파일 갯수랑 같으면 패스
            return true;
        }
        else { // 파일이 다를 경우 false를 리턴함.
            return false;
        }
    }
    else { // 파일이 처음부터 없는 경우
        return true;
    }
}

function getDirname(num){
    //원하는 상위폴더까지 리턴해줌. 0은 현재 위치까지, 1은 그 상위.. 이런 식으로
    // 리네임과, 파일의 경로를 따오기 위해 필요함.
    var order = num;
    var dirname = __dirname.split('\\');
    var result = '';
    for(var i=0;i<dirname.length-order;i++){
        result += dirname[i] + '\\';
    }
    // console.log("order: ", order);    
    // console.log("__dirname: ", __dirname);    
    // console.log("dirname: ", dirname);
    // console.log("result: ", result);
    return result;
}

function renameUploadFile(res_key, res_type, res_kind, upFile, fileIndex, uploadType){
    // 업로드 할때 리네이밍 하는 곳!
    var renameForUpload = {};
    var newFile = upFile; // 새로 들어 온 파일
    var tmpPath = [];
    var tmpType = [];
    var index = [];
    var rename = [];
    var fileName = [];
    var fullName = []; // 다운로드 시 보여줄 이름 필요하니까 원래 이름까지 같이 저장하자!
    var fsName = [];
    var virtualPath = [];

    switch(res_kind) {
        case 'fb':
            res_kind = 'facilityboard';
            break;
        case 'ub':
            res_kind = 'userboard';
            break;
        case 'usrp':
            res_kind = 'profile';
            break;
        case 'usrb':
            res_kind = 'background';
            break;
    }

    for (var i = 0; i < newFile.length; i++) {
        tmpPath[i] = newFile[i].path;
        tmpType[i] = newFile[i].mimetype.split('/')[1]; // 확장자 저장해주려고!
        index[i] = tmpPath[i].split('res\\' + res_type + 's\\' + res_kind + '\\').length;
        rename[i] = tmpPath[i].split('res\\' + res_type + 's\\' + res_kind + '\\')[index[i] - 1];
        fileName[i] = res_key + "_" + fileIndex + "." + tmpType[i]; // 파일 확장자 명까지 같이 가는 이름 "글아이디_날짜_파일명.확장자"
        fileName[i] += uploadType == 'update'? "tmp": "";

        // 단일 종류의 이미지 업로드의 경우 '_' 제외
        if( res_kind == 'profile' || res_kind == 'background' ) {
            fileName[i] = res_key + "." + tmpType[i];
        }

        fullName[i] = fileName[i] + ":" + newFile[i].originalname.split('.')[0]; // 원래 이름까지 같이 가는 이름 "글아이디_날짜_파일명.확장자:보여줄 이름"
        fsName[i] = getDirname(1) + 'res\\' + res_type + 's\\' + res_kind + '\\' + fileName[i]; // fs.rename 용 이름 "./upload/글아이디_날짜_파일명.확장자"
        virtualPath[i] = "res/" + res_type + "s/" + res_kind + "/" + fileName[i];  // DB에 넣을 프로젝트상의 경로
        // console.log("fsName[" + i + "]", fsName[i]);
    }
    renameForUpload.tmpname = tmpPath;
    renameForUpload.filename = fileName;
    renameForUpload.fullname = fullName;
    renameForUpload.fsname = fsName;
    renameForUpload.virtualpath = virtualPath;
    return renameForUpload;
}




router.post('/write', function(req, res) {

    console.log("body", req.body);

    var type = req.body.type;

    // var now = new Date();
    // var regist_time = now.getTime() - now.getTimezoneOffset() * 60000;
    var time = Date.now();

    // 전송할 변수
    var msg = new Object();

    if( type == "write" ) {

        var values1 = [
            req.body.user_no,
            req.body.category,
            JSON.stringify(req.body.coords),
            req.body.title,
            req.body.content,
            (req.body.subContent != null)? req.body.subContent.type: null,
            time,
            (req.body.category == '이벤트')? 'y': 'n',
            (req.body.expireDate == 0 || req.body.category != '이벤트')? null: req.body.expireDate,
            time,
            req.body.tag
        ];

        var stmt_duplicated1 = "insert into `userboard` set `user_no` = ?, `category` = ?, `coords` = ?, `name` = ?, `content` = ?, `sub_content` = ?, `regist_time` = ?, `event` = ?, `expire_time` = ?, `modify_time` = ?, `tag` = ?";
        
        connection.query(stmt_duplicated1, values1, function(err1, result1) {

            if( err1 ) {
                console.log('err1', err1);
                throw err1;
            }
            else {
                console.log("write success!!");
            
                var stmt_duplicated2 = "select `id` from `userboard` where `user_no` = ? and `regist_time` = ?";

                console.log(time);

                connection.query(stmt_duplicated2, [req.body.user_no, time], function(err2, result2) {

                    if( err2 ) {
                        console.log('err2', err2);
                        throw err2;
                    }
                    else {
                        console.log("created id: ", result2[0].id);
                        msg.id = result2[0].id;
                        msg = JSON.stringify(msg);

                        // 투표 / 설문 조사가 존재한다면...
                        if( req.body.subContent != null ) {
                            var values3 = [
                                result2[0].id,
                                0,
                                req.body.subContent.title,
                                JSON.stringify(req.body.subContent.content),
                                req.body.subContent.startDate,
                                req.body.subContent.endDate,
                                (req.body.subContent.type == "people")? req.body.subContent.peopleCount: 0,
                                req.body.subContent.type,
                                req.body.subContent.method
                            ];

                            var stmt_duplicated3 = "insert into `question` set `ub_id` = ?, `expired` = ?, `title` = ?, `content` = ?, `start_time` = ?, `end_time` = ?, `peopleCount` = ?, `type` = ?, `method` = ?";
        
                            connection.query(stmt_duplicated3, values3, function(err3, result3) {

                                if( err3 ) {
                                    console.log('err3', err3);
                                    throw err3;
                                }
                                else {
                                    console.log("SubContent insert complete!!");
                                    res.send(msg);
                                }
                            });
                        }
                        else {
                            res.send(msg);
                        }
                    }
                });
            }
        });
    }
    else if( type == "update" ) {

        var res_type = req.body.res_type;
        var res_kind = req.body.res_kind;
        var res_key = req.body.id; 

        var stmt_duplicated = "delete from `resource` where `res_type` = ? and `res_kind` = ? and `res_key` = ?";

        connection.query(stmt_duplicated, [res_type, res_kind, res_key], function(err, result) {
            if( err ) {
                console.log('err', err);
                throw err;
            }
            else {
                console.log("successfully changed resource table!!");

                var values1 = [
                    req.body.category,
                    JSON.stringify(req.body.coords),
                    req.body.title,
                    req.body.content,
                    (req.body.subContent != null)? req.body.subContent.type: null,
                    (req.body.category == '이벤트')? 'y': 'n',
                    (req.body.expireDate == 0 || req.body.category != '이벤트')? null: req.body.expireDate,
                    time,
                    req.body.tag,
                    req.body.id
                ];

                var stmt_duplicated1 = "update `userboard` set `category` = ?, `coords` = ?, `name` = ?, `content` = ?, `sub_content` = ?, `event` = ?, `expire_time` = ?, `modify_time` = ?, `tag` = ? where `id` = ?";
                
                connection.query(stmt_duplicated1, values1, function(err1, result1) {

                    if( err1 ) {
                        console.log('err1', err1);
                        throw err1;
                    }
                    else {
                        console.log("update success!!");

                        // 수정하는 게시 글에서 투표 / 설문 조사가 변경되었다면(삭제 후 추가했을 경우)
                        if( req.body.subContentChanged ) {

                            // 기존의 투표 / 설문 조사를 삭제
                            var stmt_duplicated2 = "delete from `question` where `ub_id` = ?";

                            connection.query(stmt_duplicated2, req.body.id, function(err2, result2) {
                                if( err2 ) {
                                    console.log('err2', err2);
                                    throw err2;
                                }
                                else {
                                    // 새로운 투표 / 설문 조사가 추가되었다면...
                                    if( req.body.subContent != null ) {
                                        var values3 = [
                                            req.body.id,
                                            0,
                                            req.body.subContent.title,
                                            JSON.stringify(req.body.subContent.content),
                                            req.body.subContent.startDate,
                                            req.body.subContent.endDate,
                                            (req.body.subContent.type == "people")? req.body.subContent.peopleCount: 0,
                                            req.body.subContent.type,
                                            req.body.subContent.method
                                        ];

                                        var stmt_duplicated3 = "insert into `question` set `ub_id` = ?, `expired` = ?, `title` = ?, `content` = ?, `start_time` = ?, `end_time` = ?, `peopleCount` = ?, `type` = ?, `method` = ?";

                                        connection.query(stmt_duplicated3, values3, function(err3, result3) {

                                            if( err3 ) {
                                                console.log('err3', err3);
                                                throw err3;
                                            }
                                            else {
                                                console.log("SubContent insert complete!!");
                                                res.json('success');
                                            }
                                        });
                                    }
                                    // 투표를 제거했을 경우
                                    else {
                                        // 투표 제거 처리
                                        // res.send(msg);
                                        res.json('success');
                                    }
                                }
                            });
                        }
                        else {
                            res.json('success');
                        }
                        // console.log("created id: ", result2[0].id);
                        // msg.id = result2[0].id;
                        // msg = JSON.stringify(msg);
                    }
                });
            }
        });
    }
});


router.post("/subcontent", function(req, res) {

    console.log("body", req.body);

    // 전송할 변수
    var msg = new Object();

    var stmt_duplicated1 = "select * from `question` where `ub_id` = ?";
        
    connection.query(stmt_duplicated1, req.body.ub_id, function(err1, result1) {

        if( err1 ) {
            console.log('err1', err1);
            throw err1;
        }
        else {

            /// 투표같은게 만료되었는지 조사 필요(expired 칼럼 0 or 1)
            /// 투표 만료조건(사람수, 기간, 등록자 강제 마감)
            

            
            var stmt_duplicated2 = "select count(*) as `cnt` from `answer` where `qes_id` = ? and `user_no` = ?";

            connection.query(stmt_duplicated2, [result1[0].id, req.body.user_no], function(err2, result2) {

                if( err2 ) {
                    console.log('err2', err2);
                    throw err2;
                }
                else {
                    // 이미 투표 / 설문 조사를 한적이 있는지 조사
                    if( result2[0].cnt == 0 ) {
                        
                        var stmt_duplicated3 = "select * from `question` where `id` = ?";

                        connection.query(stmt_duplicated3, [result1[0].id], function(err3, result3) {

                            if( err3 ) {
                                console.log('err3', err3);
                                throw err3;
                            }
                            else {
                                msg = result3[0];
                                msg.content = JSON.parse(msg.content);

                                msg = JSON.stringify(msg);
                                console.log("sub_content: ", msg);
                                res.send(msg);
                            }
                        });

                    }
                    else {
                        msg.result = "duplicated";
                        msg = JSON.stringify(msg);
                        res.send(msg);
                    }
                }
            });
        }
    });
});

router.post('/subcontenttitle', function(req, res) {
    console.log("body", req.body);

    // 전송할 변수
    var msg = new Object();

    var stmt_duplicated = "select `id`, `title`, `type` from `question` where `ub_id` = ?";
        
    connection.query(stmt_duplicated, req.body.ub_id, function(err, result) {
        if( err ) {
            console.log('err', err);
            throw err;
        }
        else {
            msg = result[0];
            msg = JSON.stringify(msg);
            console.log("sub_content: ", msg);
            res.send(msg);
        }
    });
});


router.post("/subcontentexec", function(req, res) {

    console.log("body", req.body);

    // 전송할 변수
    var msg = new Object();

    var stmt_duplicated1 = "select `expired`, `method`, `count`, `peopleCount` from `question` where `id`= ?";
    var stmt_duplicated = "select count(`id`) as `cnt` from `question` where `id` = ?";

    connection.query(stmt_duplicated, req.body.qes_id, function(err0, result0) {
        if( err0 ) {
            console.log(err0);
            throw err0;
        }
        else {
            // 해당 투표 / 설문 조사가 존재하지 않는다면
            if( result0[0].cnt == 0 ) {
                console.log("content detail has no this id: " + req.body.qes_id);
                
                var msg2 = new Object();
                msg2.result = "not exists";
                msg2 = JSON.stringify(msg2);
                res.send(msg2);
            }
            else {
                // var now = new Date();
                // var nowLocalTime = now.getTime() - now.getTimezoneOffset() * 60000;

                connection.query(stmt_duplicated1, req.body.qes_id, function(err1, result1) {
                    if( err1 ) {
                        console.log('err1', err1);
                        res.json('fail');
                        throw err1;
                    }
                    else {
                        // 만료되었는지 조사
                        if( result1[0].expired == 0 ) {

                            var values = [
                                req.body.qes_id,
                                req.body.user_no,
                                Date.now(),
                                // nowLocalTime,
                                req.body.content
                            ];

                            var stmt_duplicated2 = "insert into `answer` set `qes_id` = ?, `user_no` = ?, `date` = ?, `content` = ?";
                                
                            connection.query(stmt_duplicated2, values, function(err2, result2) {
                                if( err2 ) {
                                    console.log('err2', err2);
                                    res.json('fail');
                                    throw err2;
                                }
                                else {
                                    var stmt_duplicated3 = "update `question` set `count` = `count` + 1 where `id` = ?";

                                    connection.query(stmt_duplicated3, req.body.qes_id, function(err3, result3) {
                                        if( err3 ) {
                                            console.log('err3', err3);
                                            res.json('fail');
                                            throw err3;
                                        }
                                        else {

                                            if( result1[0].method == 'people' && result1[0].count + 1 >= result1[0].peopleCount ) {
                                                var stmt_duplicated4 = "update `question` set `expired` = 1 where `id` = ?";

                                                connection.query(stmt_duplicated4, req.body.qes_id, function(err4, result4) {
                                                    if( err4 ) {
                                                        console.log('err4', err4);
                                                        res.json('fail');
                                                        throw err4;
                                                    }
                                                    else {
                                                        console.log('Vote/Survey Complete!!');
                                                        res.json('success');
                                                    }
                                                });
                                            }
                                            else {
                                                console.log('Vote/Survey Complete!!');
                                                res.json('success');
                                            }
                                        }
                                    });
                                }
                            });
                        }
                        else {
                            msg.result = "expired";
                            msg = JSON.stringify(msg);
                            res.send(msg);
                        }
                    }
                });
            }
        }
    });

});



router.post("/subcontentresult", function(req, res) {

    console.log("body", req.body);

    // 전송할 변수
    var msg = new Object();

    var stmt_duplicated1 = "select * from `question` where `ub_id` = ?";
    
    connection.query(stmt_duplicated1, req.body.ub_id, function(err1, result1) {
        if( err1 ) {
            console.log('err1', err1);
            throw err1;
        }
        else {
            msg = result1[0];
            msg.content = JSON.parse(msg.content);
            msg.result = [];

            // 글 작성자가 투표 / 설문 조사 전체의 결과를 확인할 경우
            if( req.body.user_no == null || req.body.user_no === undefined ) {
                var stmt_duplicated2 = "select * from `answer` where `qes_id` = ?";

                connection.query(stmt_duplicated2, result1[0].id, function(err2, result2) {
                    if( err2 ) {
                        console.log('err2', err2);
                        throw err2;
                    }
                    else {
                        result2.forEach((element) => {
                            element.content = JSON.parse(element.content);
                            msg.result.push(element);
                        });

                        msg = JSON.stringify(msg);
                        res.send(msg);
                    }
                });
            }
            else {
                // 일반 사용자가 자신의 투표 / 설문 조사 정보를 확인할 경우
                var stmt_duplicated2 = "select * from `answer` where `qes_id` = ? and `user_no` = ?";

                connection.query(stmt_duplicated2, [result1[0].id, req.body.user_no], function(err2, result2) {
                    if( err2 ) {
                        console.log('err2', err2);
                        throw err2;
                    }
                    else {
                        result2.forEach((element) => {
                            element.content = JSON.parse(element.content);
                            msg.result.push(element);
                        });

                        msg = JSON.stringify(msg);
                        res.send(msg);
                    }
                });
            }
        }
    });
});

router.post("/subcontentexpired", function(req, res) {

    console.log("body", req.body);

    var stmt_duplicated1 = "select `expired` from `question` where `ub_id` = ?";
    
    connection.query(stmt_duplicated1, req.body.ub_id, function(err1, result1) {
        if( err1 ) {
            console.log('err1', err1);
            throw err1;
        }
        else {
            // 이미 종료된 투표 / 설문 조사인지 조사
            if( result1[0].expired == 0 ) {
                var stmt_duplicated2 = "update `question` set `expired` = 1 where `ub_id` = ?";

                connection.query(stmt_duplicated2,req.body.ub_id, function(err2, result2) {
                    if( err2 ) {
                        console.log('err2', err2);
                        throw err2;
                    }
                    else {
                        console.log("vote / survey expired!");
                        res.json('success');
                    }
                });
            }
            else {
                res.json('already expired');
            }
        }
    });
});

/********************************************************/



/* passport 로직 */

/*로그인 성공시 사용자 정보를 Session에 저장한다*/
passport.serializeUser(function(user, done) {
    done(null, user);
});

/*인증 후, 페이지 접근시 마다 사용자 정보를 Session에서 읽어옴.*/
passport.deserializeUser(function(user, done) {
    done(null, user);
});

/*로그인 유저 판단 로직*/
var isAuthenticated = function (req, res, next) {

  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
};

passport.use(new LocalStrategy({
        usernameField: 'email',
        passportField: 'password',
        passReqToCallback: true // 인증을 수행하는 인증 함수로 HTTP request를 그대로 전달할지 여부를 결정
    },
    function(req, email, password, done) {

        console.log("email: ", email);
        console.log("password: ", password);        

        var stmt_duplicated = "select * from `user` where `id` = ?";        

        connection.query(stmt_duplicated, email, function(err, result){
            if( err ) {
                console.log('err: ', err);
                return done(false, null);
            }
            else {
                if( result.length === 0 ) {
                    console.log("해당 유저가 없습니다.");
                    return done(false, null);
                }
                else {
                    if( password !== result[0].pw ) {
                        console.log("패스워드가 일치하지 않습니다.");
                        return done(false, null);
                    }
                    else {
                        console.log('로그인 성공');
                        return done(null, {
                            'user_no': result[0].user_no
                        });
                    }
                }
            }
        });
    }
));

function loginByThirdparty(info, done) {
    console.log('process : ', info.auth_type);

    var stmt_duplicated = "select * from `user` where `id` = ?";

    // var now = new Date();
    // var nowLocalTime = now.getTime() - now.getTimezoneOffset() * 60000;

    connection.query(stmt_duplicated, info.auth_id, function(err1, result1) {
        if( err1 ) {
            return done(err1);
        }
        else {
            if( result1.length == 0 ) {
                // TODO 신규 유저 가입
                var stmt_thirdparty_signup = "insert into `user` set `type` = ?, `id` = ?, `nickname` = ?, `email` = ?, `regist_time` = ?, `modify_time` = ?";

                var values1 = [
                    info.auth_type,
                    info.auth_id,
                    info.auth_name,
                    info.auth_email,
                    // nowLocalTime,
                    // nowLocalTime
                    Date.now(),
                    Date.now(),
                ];

                connection.query(stmt_thirdparty_signup, values1, function(err2, result2) {
                    if( err2 ) {
                        return done(err2);
                    }
                    else {
                        getUserNo(info, done, info.auth_id);
                    }
                });
            }
            else {
                // TODO 기존유저 로그인 처리
                console.log('Old User');

                done(null, {
                    'user_no': result1[0].user_no
                });
            }
        }
    });
}

function getUserNo(info, done, id) {

    var stmt_duplicated1 = "select `user_no` from `user` where `id` = ?";

    var new_user_no = -1;

    console.log("id: ", id);

    connection.query(stmt_duplicated1, id, function(err1, result1) {

        if( err1 ) {
            return done(err1);
        }
        else {

            new_user_no = result1[0].user_no;

            console.log("new_user_no", new_user_no);

            var stmt_duplicated2 = "insert into `resource` set `res_type` = ?, `res_kind` = ?, `res_key` = ?, `res_url` = ?";

            var values = [
                'image',
                'usrp',
                new_user_no,
                info.auth_profile_image
            ];

            connection.query(stmt_duplicated2, values, function(err2, result2) {
                if( err2 ) {
                    return done(err2);
                }
                else {
                    console.log("profile_img good insert!!");
                }
            });

            return done(null, {
                'user_no': new_user_no
            });
        }
    });
}

// Naver Login
passport.use(new NaverStrategy({
        clientID: secret_config.federation.naver.client_id,
        clientSecret: secret_config.federation.naver.secret_id,
        callbackURL: secret_config.federation.naver.callback_url
    },
    function(accessToken, refreshToken, profile, done) {
        var _profile = profile._json;

        console.log(refreshToken);
        console.log('Naver Login Info');
        console.log(_profile);

        loginByThirdparty({
            'auth_type': 'n',   // naver
            'auth_id': _profile.id,
            'auth_name': _profile.nickname,
            'auth_email': _profile.email,
            'auth_profile_image': _profile.profile_image
        }, done);
    }
));
/*
// Google Login
passport.use(new GoogleStrategy({
        clientID: secret_config.federation.google.client_id,
        clientSecret: secret_config.federation.google.secret_id,
        callbackURL: secret_config.federation.google.callback_url
    },
    function(accessToken, refreshToken, profile, done) {
        var _profile = profile._json;

        // console.log(refreshToken);
        console.log('Google Login Info');
        console.log(_profile);

        loginByThirdparty({
            'auth_type': 'g',  // google
            'auth_id': _profile.id,
            'auth_name': _profile.displayName,
            'auth_email': _profile.emails[0].value,
            'auth_profile_image': _profile.image.url
        }, done);
    }
));
*/
// Facebook Login
passport.use(new FacebookStrategy({
        clientID: secret_config.federation.facebook.client_id,
        clientSecret: secret_config.federation.facebook.secret_id,
        callbackURL: secret_config.federation.facebook.callback_url,
        profileFields: ['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified', 'displayName']
    },
    function(accessToken, refreshToken, profile, done) {
        var _profile = profile._json;

        // console.log(refreshToken);
        console.log('Facebook Login Info');
        console.log(_profile);

        loginByThirdparty({
            'auth_type': 'f',    // facebook
            'auth_id': _profile.id,
            'auth_name': _profile.name,
            'auth_email': _profile.email,
            'auth_profile_image': 'https://graph.facebook.com/' + _profile.id + '/picture?type=large'
        }, done);
    }
));

// Kakao Login
passport.use(new KakaoStrategy({
        clientID: secret_config.federation.kakao.client_id,
        callbackURL: secret_config.federation.kakao.callback_url
    },
    function(accessToken, refreshToken, profile, done) {
        var _profile = profile._json;

        // console.log(refreshToken);
        console.log('Kakao Login Info');
        console.log(_profile);
        // TODO 유저 정보와 done을 공통 함수에 던지고 해당 함수에서 공통으로 회원가입 절차를 진행할 수 있도록 한다.

        loginByThirdparty({
            'auth_type': 'k',   // kakao
            'auth_id': _profile.id,
            'auth_name': _profile.properties.nickname,
            'auth_email': _profile.kaccount_email,
            'auth_profile_image': _profile.properties.profile_image
        }, done);
    }
));

// Naver Login
router.get('/auth/login/naver', passport.authenticate('naver'));

// Naver Login 연동 callback
router.get('/auth/login/naver/callback',
    passport.authenticate('naver', {
        successRedirect: '/loginSuccess',
        failureRedirect: '/login'
    })
);
/*
// Google Login
router.get('/auth/login/google', passport.authenticate('google', {scope: ['openid', 'email', 'profile']}));

// Google Login 연동 callback
router.get('/auth/login/google/callback',
    passport.authenticate('google', {
        successRedirect: '/loginSuccess',
        failureRedirect: '/login'
    })
);
*/
// Kakao Login
router.get('/auth/login/kakao', passport.authenticate('kakao'));

// Kakao Login 연동 callback
router.get('/auth/login/kakao/callback',
    passport.authenticate('kakao', {
        successRedirect: '/loginSuccess',
        failureRedirect: '/login'
    })
);

// Facebook Login
router.get('/auth/login/facebook', passport.authenticate('facebook'));

// Facebook Login 연동 callback
router.get('/auth/login/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect: '/loginSuccess',
        failureRedirect: '/login'
    })
);
/*---------------*/

router.get('/login', function(req, res) {
    console.log("req.user: ", req.user);
    if( req.user !== undefined ) {
        res.json('success');
    }
    else {
        res.json('fail');
    }
});

/*Log out*/
// router.get('/logout', function (req, res) {
//   req.logout();
//   res.redirect('/');
// });

router.post('/login', passport.authenticate('local', {failureRedirect: '/login', failureFlash: true}),
    function(req, res) {
        console.log("local!!: ", req.user);
        res.send(req.user);
    }
);

router.get('/loginSuccess', isAuthenticated,function(req, res) {
    console.log(req.user);
    res.send(JSON.stringify(req.user));
});

// router.get('/error', function(req, res) {
//     res.send('fail: ' + req);
// });



router.post('/checkid', function(req, res) {
    console.log('checkid: ', req.body.emailAddr);

    var stmt_duplicated = "select count(*) as `num` from `user` where `id` = ?";

    connection.query(stmt_duplicated, req.body.emailAddr, function(err, result) {
        if( err ) {
            console.log('err', err);
            throw err;
        }
        else {
            console.log("result: ", result[0].num);

            // 해당 id가 존재하지 않으면
            if( result[0].num == 0 ) {
                console.log('SendMail request!!');
                console.log('emailAddr: ', req.body.emailAddr);
                console.log('certNum: ', req.body.certNum);

                // res.json('success');
                
                mail.send({
                    to: req.body.emailAddr,
                    subject: "CM_KNUT 회원가입",
                    data: "CM_KNUT 회원가입을 위해 인증번호 <B>" + req.body.certNum + "</B>를 입력해주세요." ,
                    res: res
                });
            }
            else {
                console.log("Id exists. Confirm your email.");
                res.json('duplicated email');
            }
        }
    });    
});

router.post('/createuser', function(req, res) {

    var stmt_duplicated = "insert into `user` set `type` = ?, `id` = ?, `pw` = ?, `nickname` = ?, `regist_time` = ?, `modify_time` = ?, `gender` = ?, `birth` = ?";
    
    // var now = new Date();
    // var nowLocalTime = now.getTime() - now.getTimezoneOffset() * 60000;

    var values = [
        req.body.type,
        req.body.id,
        req.body.pw,
        req.body.name,
        // nowLocalTime,
        // nowLocalTime,
        Date.now(),
        Date.now(),
        req.body.gender,
        req.body.birth
    ];

    console.log(values);

    connection.query(stmt_duplicated, values, function(err, result) {
        if( err ) {
            console.log('err', err);
            res.json('fail');
            throw err;
        }
        else {
            console.log('Create user success!!');
            
            res.json('success');
        }
    });  
});

router.post('/userunlink', function(req, res) {
    var user_no = req.body.user_no;
    var domainURL = req.body.domainURL;
    var postId = req.body.postId;
    var resourceSrc = req.body.resourceSrc;

    console.log('unlink user_no: ', user_no);
    console.log('unlink domainURL: ', domainURL);
    console.log('unlink postId: ', postId);
    console.log('unlink resourceSrc: ', resourceSrc);

    var stmt_duplicated = "delete from `user` where `user_no` = ?";

    connection.query(stmt_duplicated, user_no, function(err, result) {
        if( err ) {
            console.log('err', err);
            res.json('fail');
            throw err;
        }
        else {

            if( postId.length > 0 ) {
                var ids = "";

                postId.forEach((element) => {
                    ids += element + ", ";
                });

                ids = ids.substring(0, ids.length - 2);

                console.log("ids: ", ids);

                var stmt_duplicated1 = "select * from `resource` where `res_kind` = 'ub' and `res_key` in (" + ids + ")";
                var filePath = [];

                console.log(stmt_duplicated1);

                connection.query(stmt_duplicated1, function(err1, result1) {
                    if( err1 ) {
                        console.log("err1", err1);
                        res.json('fail');
                        throw err1;
                    }
                    else {
                        console.log('gg', result1);
                        if( result1.length > 0 ) {
                            result1.forEach((result) => {
                                filePath.push(result.res_url);
                            });

                            console.log('removeFilePath: ', filePath);

                            var stmt_duplicated2 = "delete from `resource` where `res_kind` = 'ub' and `res_key` in (" + ids + ")";

                            connection.query(stmt_duplicated2, function(err2, result2) {
                                if( err2 ) {
                                    console.log("err2", err2);
                                    res.json('fail');
                                    throw err2;
                                }
                                else {

                                    filePath.forEach((filepath) => {
                                        var fileFullPath = getDirname(1) + filepath;
                                        // var fileFullPath = 'res\\' + res_type + 's\\' + res_kind + '\\' + res_key + "_" + fileIndex;
                                        // fileFullPath += (res_type == 'image')? '.jpeg': '';

                                        console.log(fileFullPath);

                                        fs.exists(fileFullPath, function (exists) { 

                                            if( exists ) {
                                                console.log("It's there");

                                                fs.unlink(fileFullPath, function (err) { 
                                                    if( err ) {
                                                        throw err;
                                                    }
                                                    else {
                                                        console.log('successfully deleted ' + fileFullPath);
                                                    }
                                                });
                                            }
                                            else {
                                                console.log("no exists!"); 
                                            }
                                        });
                                    });
                                }
                            });
                        }
                    }
                });
            }

            

            resourceSrc.forEach((element) => {
                if( element.src != null && element.src !== undefined ) {
                    if( element.src.includes(domainURL) ) {
                        var fileFullPath = getDirname(1) + element.src.replace(domainURL, "").split('?')[0];
                        // var fileFullPath = 'res\\' + res_type + 's\\' + res_kind + '\\' + res_key + "_" + fileIndex;
                        // fileFullPath += (res_type == 'image')? '.jpeg': '';

                        console.log(fileFullPath);

                        fs.exists(fileFullPath, function (exists) { 

                            if( exists ) {
                                console.log("It's there");

                                fs.unlink(fileFullPath, function (err) { 
                                    if( err ) {
                                        throw err;
                                    }
                                    else {
                                        console.log('successfully deleted ' + fileFullPath);
                                    }
                                });
                            }
                            else {
                                console.log("no exists!"); 
                            }
                        });
                    }

                    var stmt_duplicated2 = "delete from `resource` where `res_kind` = ? and `res_key` = ?";

                    connection.query(stmt_duplicated2, [element.kind, user_no], function(err2, result2) {
                        if( err2 ) {
                            console.log('err2', err2);
                            res.json('fail');
                            throw err;
                        }
                    });
                }
            });

            console.log('Remove user success!!');
            res.json('success');
        }
    });
});

router.post('/userinfo', function(req, res) {
    // console.log(req);

    var stmt_duplicated1 = "select * from `user` where `user_no` = ?";
    var stmt_duplicated2 = "select `res_kind`, `res_url` from `resource` where `res_kind` in('usrp', 'usrb') and `res_key` = ?";
    var stmt_duplicated3 = "select `id`, `category`, `name` from `userboard` where `user_no` = ?";
    
    console.log("user_no: ", req.body.user_no);

    if( req.body.user_no == null || req.body.user_no == undefined ) {
        res.json(null);
        return;
    }

    // req.body.user_no = 3;

    // 전송할 변수
    var msg = "";

    connection.query(stmt_duplicated1, req.body.user_no, function(err1, result1) {
        if( err1 ) {
            console.log('err1', err1);
            throw err1;
        }
        else {
            if( result1.length == 0 ) {
                console.log('Empty Set!!');
                res.json("Empty Set!!");
            }
            else {
                // console.log('return userinfo', result);
                console.log('userinfo success!!');
                // res.send(result[0]);

                msg = result1[0];
                msg.intro = msg.intro == null? "": msg.intro;
                msg.info = msg.info == null? "": msg.info;
                // msg.gender = msg.gender == null? "": msg.gender;
                // msg.birth = msg.birth == null? "": msg.birth;
                msg.gender = msg.gender;
                msg.birth = msg.birth;
                msg.profileImg = [];
                msg.bgImg = [];
                msg.contents = [];

                connection.query(stmt_duplicated2, req.body.user_no, function(err2, result2) {
                    if( err2 ) {
                        console.log('err2', err2);
                        throw err2;
                    }
                    else {
                        if( result2.length == 0 ) {
                            console.log('Empty Set!!');
                        }
                        else {
                            result2.forEach((element) => {
                                if( element.res_kind == 'usrp' ) {
                                    msg.profileImg.push(element.res_url);
                                }
                                else {
                                    msg.bgImg.push(element.res_url);
                                }
                            });
                        }
                        connection.query(stmt_duplicated3, req.body.user_no, function(err3, result3) {
                            if( err3 ) {
                                console.log('err3', err3);
                                throw err3;
                            }
                            else {
                                if( result3.length == 0 ) {
                                    console.log('Empty Set!!');
                                }
                                else {
                                    msg.contents = result3;
                                }
                                res.send(msg);
                            }
                        });
                    }
                });
            }
        }
    });
});

router.post('/pwsearch', function(req, res) {
    console.log('pwsearch: ', req.body.emailAddr);

    var stmt_duplicated = "select count(*) as `num` from `user` where `id` = ?";

    connection.query(stmt_duplicated, req.body.emailAddr, function(err, result) {
        if( err ) {
            console.log('err', err);
            throw err;
        }
        else {
            console.log("result: ", result[0].num);

            // 해당 id가 존재하면
            if( result[0].num > 0 ) {
                console.log('SendMail request!!');
                console.log('emailAddr: ', req.body.emailAddr);
                console.log('certNum: ', req.body.certNum);

                // res.json('success');
                
                mail.send({
                    to: req.body.emailAddr,
                    subject: "CM_KNUT 비밀번호 변경을 위한 인증번호",
                    data: "CM_KNUT 비밀번호 변경을 위해 인증번호 <B>" + req.body.certNum + "</B>를 입력해주세요." ,
                    res: res
                });
            }
            else {
                console.log("Id doesn't exist. Confirm your email.");
                res.json('does not exist');
            }
        }
    });    
});

router.post('/updatepw', function(req, res) {
    console.log('updatepw: ', req.body.emailAddr + " => " + req.body.pw);

    var stmt_duplicated = "update `user` set `pw` = ? where `id` = ?";

    connection.query(stmt_duplicated, [req.body.pw, req.body.emailAddr], function(err, result) {
        if( err ) {
            console.log('err', err);
            throw err;
        }
        else {
            res.json('success');
        }
    });    
});

router.post('/userinfoupdate', function(req, res) {
    console.log('userinfoupdate_id: ', req.body.user_no);

    console.log(req.body);

    var stmt_duplicated1 = "update `user` set `nickname` = ?, `intro` = ?, `info` = ?, `gender` = ?, `birth` = ?, `modify_time` = ? where `user_no` = ?";
    var stmt_duplicated2 = "update `user` set `pw` = ?, `nickname` = ?, `intro` = ?, `info` = ?, `gender` = ?, `birth` = ?, `modify_time` = ? where `user_no` = ?";

    let values1 = [
        req.body.nickname,
        req.body.intro,
        req.body.info,
        req.body.gender,
        req.body.birth,
        Date.now(),
        req.body.user_no,
    ];

    let values2 = [
        req.body.newPw,
        req.body.nickname,
        req.body.intro,
        req.body.info,
        req.body.gender,
        req.body.birth,
        Date.now(),
        req.body.user_no,
    ];

    // 비밀번호 변경이 있을 경우
    if( req.body.changePw ) {
        connection.query(stmt_duplicated2, values2, function(err, result) {
            if( err ) {
                console.log('err', err);
                throw err;
            }
            else {
                res.json('success');
            }
        });
    }
    else {
        connection.query(stmt_duplicated1, values1, function(err, result) {
            if( err ) {
                console.log('err', err);
                throw err;
            }
            else {
                res.json('success');
            }
        });    
    }   
});


/*********************************************************************************************************************************/
router.post('/detailfacility', function(req, res){

    console.log('\n\n****** /detailfacility ******', 'paramId : ' + req.body.paramId);

    var msg = "";
    var paramId = req.body.paramId;

    var stmt_facility1 = "select * from facilityboard where id like ?";
    var stmt_facility2 = "select res_url from resource where res_key like ? and res_kind like 'fb'";

    connection.query(stmt_facility1, paramId, function(err1, result1){
        if(err1) throw err1;
        else{
            if(result1 != null){
                async.each(result1, childFacilityFunction, function(err){
                    if(err) throw err;
                    else{
                        console.log('msg : ', msg);
                        res.send(msg)
                    }
                });
            }
            else{
                msg = null;
            }
        }
    });

    function childFacilityFunction(item, doneCallback){
        item.board = 'facilityboard';
        item.resourceSrc = [];
        item.issue = [];
        // issueObj = {
        //     id: '',
        //     category: '',
        //     title: '',
        //     registTime: ''
        // }

        connection.query(stmt_facility2, item.id, function(err2, result2){
            if(err2) throw err2;
            else{
                if(result2 == null) item.resourceSrc.push(null);
                else{
                    result2.forEach(function(element) {
                        item.resourceSrc.push(element.res_url);
                        // item.resourceSrc.push(element.res_url);
                    });
                    // msg = item;
                }
            }
            // doneCallback(null);
        });

        var stmt_issue = "select id, category, name, regist_time, substring_index(substring_index(replace(replace(replace(coords->'$[*].lat', '[', ''), ']', ''), ' ', ''), ',', numbers.n), ',', -1) latitude, substring_index(substring_index(replace(replace(replace(coords->'$[*].lng', '[', ''), ']', ''), ' ', ''), ',', numbers.n), ',', -1) longitude from (select 1 n union all select 2 union all select 3 union all select 4 union all select 5) numbers inner join userboard on char_length(replace(replace(replace(coords->'$[*].lat', '[', ''), ']', ''), ' ', ''))-char_length(replace(replace(replace(replace(coords->'$[*].lat', '[', ''), ']', ''), ' ', ''), ',', '')) >= numbers.n-1  and `event` != 'e' order by n";
        connection.query(stmt_issue, function(err3, result3){
            if(err3) throw err3
            else{
                result3.forEach(function(element){
                    // console.log("여기까지는 찍힘?", "item.latitude : " + item.latitude + ", item.longitude : " + item.longitude + ", element.latitude : " + element.latitude + ", element.longitude : " + element.longitude);
                    var distanceKm = Math.round( distance(item.latitude, item.longitude, element.latitude, element.longitude) * 1000 ) / 1000;
                    console.log("거리계산 distance : ", "id : " + element.id + ", distance : " + distanceKm);
                    if( distanceKm < 0.5 ){
                        issueObj = { id: '', category: '', title: '', registTime: '' }
                        issueObj.id = element.id;
                        issueObj.category = element.category;
                        issueObj.title = element.name;
                        issueObj.registTime = element.regist_time;

                        // console.log("issueObj : ", issueObj);
                        var issueFlag = true;
                        for(var j = 0; j < item.issue.length; j++){
                            if( item.issue[j].id == element.id ){
                                issueFlag = false;
                            }
                        }
                        if(issueFlag)
                            item.issue.push(issueObj);
                    }
                });

                msg = item;
            }
            doneCallback(null);
        });

        function distance(lat1, lon1, lat2, lon2) {
            var radlat1 = Math.PI * lat1/180
            var radlat2 = Math.PI * lat2/180
            var radlon1 = Math.PI * lon1/180
            var radlon2 = Math.PI * lon2/180
            var theta = lon1-lon2
            var radtheta = Math.PI * theta/180
            var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
            dist = Math.acos(dist)
            dist = dist * 180/Math.PI
            dist = dist * 60 * 1.1515
            dist = dist * 1.609344
            // if (unit=="K") { dist = dist * 1.609344 }
            // if (unit=="N") { dist = dist * 0.8684 }
            return dist;
        }
    }

    // function distance(lat1, lon1, lat2, lon2) {
    //     var radlat1 = Math.PI * lat1/180
    //     var radlat2 = Math.PI * lat2/180
    //     var radlon1 = Math.PI * lon1/180
    //     var radlon2 = Math.PI * lon2/180
    //     var theta = lon1-lon2
    //     var radtheta = Math.PI * theta/180
    //     var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    //     dist = Math.acos(dist)
    //     dist = dist * 180/Math.PI
    //     dist = dist * 60 * 1.1515
    //     dist = dist * 1.609344
    //     // if (unit=="K") { dist = dist * 1.609344 }
    //     // if (unit=="N") { dist = dist * 0.8684 }
    //     return dist
    // }

});

router.post('/homemap', function(req, res){

    console.log('\n\n****** /homemap ******');

    var msg = [];
    var item = [];

    var stmt_facilityboard = "select id, category, latitude, longitude from facilityboard";
    var stmt_userboard = "select id, category, substring_index(substring_index(replace(replace(replace(coords->'$[*].lat', '[', ''), ']', ''), ' ', ''), ',', numbers.n), ',', -1) latitude, substring_index(substring_index(replace(replace(replace(coords->'$[*].lng', '[', ''), ']', ''), ' ', ''), ',', numbers.n), ',', -1) longitude from (select 1 n union all select 2 union all select 3 union all select 4 union all select 5) numbers inner join userboard on char_length(replace(replace(replace(coords->'$[*].lat', '[', ''), ']', ''), ' ', ''))-char_length(replace(replace(replace(replace(coords->'$[*].lat', '[', ''), ']', ''), ' ', ''), ',', '')) >= numbers.n-1  and `event` != 'e' order by n";

    connection.query(stmt_facilityboard, function(err1, result1){
        if(err1) throw err1;
        else{
            result1.forEach((element) => {
                element.type = "facilityboard";
                item.push(element);
            });
            // msg.push(result1);

            connection.query(stmt_userboard, function(err2, result2){
                if(err2) throw err2;
                else{
                    result2.forEach((element) => {
                        element.type = "userboard";
                        element.latitude = Number(element.latitude);
                        element.longitude = Number(element.longitude);
                        item.push(element);
                    });
                    msg.push(item);

                    console.log('msg : ', msg);
                    res.send(msg);
                }
            });
        }
    });

});

router.post('/docontentlike', function(req, res){

    console.log('\n\n****** /docontentlike ******', 'ub_id : ' + req.body.ub_id + ', user_no : ' + req.body.user_no + ', type : ' + req.body.type);

    var ub_id = req.body.ub_id;
    var user_no = req.body.user_no;
    var type = req.body.type;

    var stmt_duplicated = "select count(`id`) as `cnt` from `userboard` where `id` = ?";

    connection.query(stmt_duplicated, ub_id, function(err0, result0) {
        if( err0 ) {
            console.log(err0);
            throw err0;
        }
        else {
            // 해당 게시글이 존재하지 않는다면
            if( result0[0].cnt == 0 ) {
                console.log("content detail has no this id: " + ub_id);
                
                var msg2 = new Object();
                msg2.result = "not exists";
                msg2 = JSON.stringify(msg2);
                res.send(msg2);
            }
            else {
                if( type == 'insert' ){
        
                    var stmt_insert = "insert into preference values(?, ?, ?)";

                    // var now = new Date();
                    // var nowLocalTime = now.getTime() - now.getTimezoneOffset() * 60000;

                    connection.query(stmt_insert, [ub_id, user_no, Date.now()], function(err, result){
                    // connection.query(stmt_insert, [ub_id, user_no, nowLocalTime], function(err, result){
                        if(err) throw err;
                    });

                }else if( type == 'delete' ){

                    var stmt_delete = "delete from preference where ub_id like ? and user_no like ?";

                    connection.query(stmt_delete, [ub_id, user_no], function(err, result){
                        if(err) throw err;
                    });
                }

                res.json(type + ' 완료');
            }
        }
    });
});

router.post('/contentlike', function(req, res){

    console.log('\n\n****** /contentlike ******', 'ub_id : ' + req.body.ub_id);

    var msg = [];
    var ub_id = req.body.ub_id;

    var stmt_duplicated = "select count(`id`) as `cnt` from `userboard` where `id` = ?";
    var stmt_duplicated1 = "select user_no from preference where ub_id like ?";
    var stmt_duplicated2 = "select type, nickname from user where user_no like ?";
    var stmt_duplicated3 = "select res_url from resource where res_key like ? and res_kind like 'usrp'";

    connection.query(stmt_duplicated, ub_id, function(err0, result0) {
        if( err0 ) {
            console.log(err0);
            throw err0;
        }
        else {
            // 해당 게시글이 존재하지 않는다면
            if( result0[0].cnt == 0 ) {
                console.log("content detail has no this id: " + ub_id);
                
                var msg2 = new Object();
                msg2.result = "not exists";
                msg2 = JSON.stringify(msg2);
                res.send(msg2);
            }
            else {
                connection.query(stmt_duplicated1, ub_id, function(err1, result1){
                    if(err1) throw err1;
                    else{
                        if(result1.length != 0){
                            async.each(result1, childFunction, function(err){
                                if(err) throw err;
                                else{
                                    console.log('(IF) msg : ', msg);

                                    res.send(msg);
                                }
                            });
                        }
                        else{
                            console.log('(ELSE) msg : ', msg);

                            res.send(msg);
                        }
                    }
                });
            }
        }
    });

    function childFunction(item, doneCallback){        
        item.username = "";
        item.profile = "";
        item.type = "";
       
        connection.query(stmt_duplicated2, item.user_no, function(err2, result2){
            if(err2) throw err2;
            else{
                item.username = result2[0].nickname;
                item.type = result2[0].type;
            }
        });
        
        connection.query(stmt_duplicated3, item.user_no, function(err3, result3){
            if(err3) throw err3;
            else{
                // console.log(result3.length);
                if(result3.length != 0) item.profile = result3[0].res_url;

                msg.push(item);
            }
            doneCallback(null);
        });
    }

});

router.post('/contentreplyreply', function(req, res){

    console.log('\n\n****** /contentreplyreply ******', 'ub_id : ' + req.body.ub_id + ', grp_no : ' + req.body.grp_no + ', yourId : ' + req.body.user_no + ', content : ' + req.body.content);

    // var now = new Date();
    // var nowLocalTime = now.getTime() - now.getTimezoneOffset() * 60000;

    var msg = [];
    var ub_id = req.body.ub_id;
    var c_id = req.body.c_id;
    var grp_no = req.body.grp_no;
    var user_no = req.body.user_no;
    if( user_no == null || user_no == 'undefined' ) user_no = -1;
    var content = req.body.content;

    console.log("c_id", c_id);

    var stmt_duplicated = "select count(`id`) as `cnt` from `userboard` where `id` = ?";
    var stmt_replyreply1 = "select id, user_no, date, content from comment where ub_id like ? and grp_no like ? and level = 2 order by id desc";
    var stmt_replyreply2 = "select type, nickname from user where user_no like ?";
    var stmt_replyreply3 = "select res_url from resource where res_key like ? and res_kind like 'usrp'";
    var stmt_replyreply4 = "select * from commentpreference where c_id like ?";
    var stmt_replyreply5 = "select * from commentpreference where c_id like ? and user_no = " + user_no;

    connection.query(stmt_duplicated, ub_id, function(err0, result0) {
        if( err0 ) {
            console.log(err0);
            throw err0;
        }
        else {
            // 해당 게시글이 존재하지 않는다면
            if( result0[0].cnt == 0 ) {
                console.log("content detail has no this id: " + ub_id);
                
                var msg2 = new Object();
                msg2.result = "not exists";
                msg2 = JSON.stringify(msg2);
                res.send(msg2);
            }
            else {

                var stmt_duplicated2 = "select count(`id`) as `cnt` from `comment` where `id` = ?";

                connection.query(stmt_duplicated2, c_id, function(err01, result01) {
                    if( err01 ) {
                        console.log(err01);
                        throw err01;
                    }
                    else {
                        // 해당 게시글이 존재하지 않는다면
                        if( result01[0].cnt == 0 ) {
                            console.log("content detail has no this id: " + c_id);
                            
                            var msg2 = new Object();
                            msg2.result = "not exists2";
                            msg2 = JSON.stringify(msg2);
                            res.send(msg2);
                        }
                        else {

                            if( content != null && content != 'undefined' ){
                    
                                // insert into comment(ub_id, user_no, date, content, grp_no) values(2, 1, 1495468518279, '333333333테스트', 3);
                                var stmt_reply_insert1 = "insert into comment(ub_id, user_no, date, content, grp_no, level) values(?, ?, ?, ?, ?, 2)";

                                connection.query(stmt_reply_insert1, [ub_id, user_no, Date.now(), content, grp_no], function(err_insert1, result_insert1){
                                // connection.query(stmt_reply_insert1, [ub_id, user_no, nowLocalTime, content, grp_no], function(err_insert1, result_insert1){
                                    if(err_insert1) throw err_insert1;
                                });
                            }

                            connection.query(stmt_replyreply1, [ub_id, grp_no], function(err1, result1){
                                if(err1) throw err1;
                                else{
                                    if(result1.length != 0){
                                        async.each(result1, childFunction, function(err){
                                            if(err) throw err;
                                            else{
                                                console.log('(IF) msg : ', msg);

                                                res.send(msg);
                                            }
                                        });
                                    }
                                    else{
                                        console.log('(ELSE) msg : ', msg);

                                        res.send(msg);
                                    }
                                }
                            });
                        }
                    }
                });
            }
        }
    });

    function childFunction(item, doneCallback){
        // console.log('전달받은 item : ', item);
        
        item.username = "";
        item.profile = "";
        item.type = "";
        item.yours;
        item.totalLikeCount = 0;
       
        connection.query(stmt_replyreply2, item.user_no, function(err2, result2){
            if(err2) throw err2;
            else{
                item.username = result2[0].nickname;
                item.type = result2[0].type;
            }
        });
        
        connection.query(stmt_replyreply3, item.user_no, function(err3, result3){
            if(err3) throw err3;
            else{
                // console.log(result3.length);
                if(result3.length != 0) item.profile = result3[0].res_url;
            }
        });

        connection.query(stmt_replyreply4, item.id, function(err4, result4){
            if(err4) throw err4;
            else{
                if(result4.length != 0) item.totalLikeCount = result4.length;
                else item.totalLikeCount = 0;
            }
        });

        connection.query(stmt_replyreply5, item.id, function(err5, result5){
            if(err5) throw err5;
            else{
                if(result5.length != 0) item.yours = true;
                else item.yours = false;

                msg.push(item);
            }
            doneCallback(null);
        });
    }

});

router.post('/commentupdatedelete', function(req, res){

    console.log('\n\n****** /commentupdatedelete ******', 'c_id : ' + req.body.c_id + ', content : ' + req.body.content + ', type : ' + req.body.type);

    var c_id = req.body.c_id;
    var content = req.body.content;
    var type = req.body.type;
    var ub_id = req.body.ub_id

    var stmt_duplicated = "select count(`id`) as `cnt` from `userboard` where `id` = ?";

    connection.query(stmt_duplicated, ub_id, function(err0, result0) {
        if( err0 ) {
            console.log(err0);
            throw err0;
        }
        else {
            // 해당 게시글이 존재하지 않는다면
            if( result0[0].cnt == 0 ) {
                console.log("content detail has no this id: " + ub_id);
                
                var msg2 = new Object();
                msg2.result = "not exists";
                msg2 = JSON.stringify(msg2);
                res.send(msg2);
            }
            else {
                var stmt_duplicated2 = "select count(`id`) as `cnt` from `comment` where `id` = ?";

                connection.query(stmt_duplicated2, c_id, function(err01, result01) {
                    if( err01 ) {
                        console.log(err01);
                        throw err01;
                    }
                    else {
                        // 해당 댓글이 존재하지 않는다면
                        if( result01[0].cnt == 0 ) {
                            console.log("content detail has no this id: " + c_id);
                            
                            var msg2 = new Object();
                            msg2.result = "not exists2";
                            msg2 = JSON.stringify(msg2);
                            res.send(msg2);
                        }
                        else {
                            if( type == 'update' ){

                                var stmt_update = "update comment set content = ? where id like ?";

                                connection.query(stmt_update, [content, c_id], function(err, result){
                                    if(err) throw err;
                                });

                            }else if( type == 'delete' ){

                                // delete from comment where ub_id = (select ub_id from comment where id = ?) and grp_no = (select grp_no from comment where id = ?)
                                var stmt_delete = "delete from comment where ub_id = ? and grp_no = ?";

                                connection.query(stmt_delete, [req.body.ub_id, req.body.grp_no], function(err, result){
                                    if(err) throw err;
                                });

                            }else if( type == 'deletereply' ){

                                var stmt_deletereply = "delete from comment where id like ?";

                                connection.query(stmt_deletereply, c_id, function(err, result){
                                    if(err) throw err;
                                });
                            }

                            res.json(type + ' 완료');
                        }
                    }
                });
            }
        }
    });

    
});

router.post('/commentlike', function(req, res){

    console.log('\n\n****** /commentlike ******', 'c_id : ' + req.body.c_id + ', user_no : ' + req.body.user_no + ', type : ' + req.body.type);

    var c_id = req.body.c_id;
    var user_no = req.body.user_no;
    var type = req.body.type;
    var ub_id = req.body.ub_id;

    // var now = new Date();
    // var nowLocalTime = now.getTime() - now.getTimezoneOffset() * 60000;

    var stmt_duplicated = "select count(`id`) as `cnt` from `userboard` where `id` = ?";

    connection.query(stmt_duplicated, ub_id, function(err0, result0) {
        if( err0 ) {
            console.log(err0);
            throw err0;
        }
        else {
            // 해당 게시글이 존재하지 않는다면
            if( result0[0].cnt == 0 ) {
                console.log("content detail has no this id: " + ub_id);
                
                var msg2 = new Object();
                msg2.result = "not exists";
                msg2 = JSON.stringify(msg2);
                res.send(msg2);
            }
            else {

                var stmt_duplicated2 = "select count(`id`) as `cnt` from `comment` where `id` = ?";

                connection.query(stmt_duplicated2, c_id, function(err01, result01) {
                    if( err01 ) {
                        console.log(err01);
                        throw err01;
                    }
                    else {
                        // 해당 댓글이 존재하지 않는다면
                        if( result01[0].cnt == 0 ) {
                            console.log("content detail has no this id: " + c_id);
                            
                            var msg2 = new Object();
                            msg2.result = "not exists2";
                            msg2 = JSON.stringify(msg2);
                            res.send(msg2);
                        }
                        else {
                            if( type == 'insert' ){
        
                                var stmt_insert = "insert into commentpreference values(?, ?, ?)";


                                connection.query(stmt_insert, [c_id, user_no, Date.now()], function(err, result){
                                // connection.query(stmt_insert, [c_id, user_no, nowLocalTime], function(err, result){
                                    if(err) throw err;
                                });

                            }else if( type == 'delete' ){

                                var stmt_delete = "delete from commentpreference where c_id like ? and user_no like ?";

                                connection.query(stmt_delete, [c_id, user_no], function(err, result){
                                    if(err) throw err;
                                });
                            }

                            res.json(type + ' 완료');
                        }
                    }
                });
            }
        }
    });
});

router.post('/contentreply', function(req, res){

    console.log('\n\n****** /contentreply ******', 'paramId : ' + req.body.paramId + ', yourId : ' + req.body.user_no + ', content : ' + req.body.content);

    var msg = [];
    var paramId = req.body.paramId;
    var user_no = req.body.user_no;
    if( user_no == null || user_no == 'undefined' ) user_no = -1;
    var grp_no = req.body.grp_no;
    // if( grp_no == null || grp_no == 'undefined') grp_no = -1;
    var content = req.body.content;

    var stmt_duplicated = "select count(`id`) as `cnt` from `userboard` where `id` = ?";
    var stmt_reply1 = "select id, user_no, date, content, grp_no from comment where ub_id like ? and level = 1 order by id desc";
    var stmt_reply2 = "select id, type, nickname from user where user_no like ?";
    var stmt_reply3 = "select res_url from resource where res_key like ? and res_kind like 'usrp'";
    var stmt_reply4 = "select * from commentpreference where c_id like ?";
    var stmt_reply5 = "select * from commentpreference where c_id like ? and user_no = " + user_no;
    var stmt_reply6 = "select user_no, content from comment where ub_id like ? and level = 2 and grp_no like ? order by id desc limit 1";

    connection.query(stmt_duplicated, paramId, function(err0, result0) {
        if( err0 ) {
            console.log(err0);
            throw err0;
        }
        else {
            // 해당 게시글이 존재하지 않는다면
            if( result0[0].cnt == 0 ) {
                console.log("content detail has no this id: " + paramId);
                
                var msg2 = new Object();
                msg2.result = "not exists";
                msg2 = JSON.stringify(msg2);
                res.send(msg2);
            }
            else {
                if( content != null && content != 'undefined' ){
        
                    // insert into comment(ub_id, user_no, date, content, grp_no) values(2, 1, 1495468518279, '333333333테스트', 3);
                    var stmt_reply_insert1 = "insert into comment(ub_id, user_no, date, content, grp_no) values(?, ?, ?, ?, ?)";

                    // var now = new Date();
                    // var nowLocalTime = now.getTime() - now.getTimezoneOffset() * 60000;

                    connection.query(stmt_reply_insert1, [paramId, user_no, Date.now(), content, grp_no], function(err_insert1, result_insert1){
                    // connection.query(stmt_reply_insert1, [paramId, user_no, nowLocalTime, content, grp_no], function(err_insert1, result_insert1){
                        if(err_insert1) throw err_insert1;
                    });
                }

                //select id, user_no, date, content, grp_no from comment where ub_id like 1 and level = 1;
                

                connection.query(stmt_reply1, paramId, function(err1, result1){
                    if(err1) throw err1;
                    else{
                        if(result1.length != 0){
                            console.log('\n\n\n\n\nresult1 : ', result1);
                            async.each(result1, childFunction, function(err){
                                if(err) throw err;
                                else{
                                    console.log('(IF) msg : ', msg);

                                    res.send(msg);
                                }
                            });
                        }
                        else{
                            console.log('(ELSE) msg : ', msg);

                            res.send(msg);
                        }
                    }
                });
            }
        }
    });

    function childFunction(item, doneCallback){
        // console.log('전달받은 item : ', item);
        item.userid = "";
        item.username = "";
        item.profile = "";
        item.type = "";
        item.yours;
        item.totalLikeCount = 0;
        // item.reply = null;
        item.reply = {
            username: '',
            profile: '',
            content: '',
            type: ''
        }

        // 2-3-4-5-(6-2-3)
        connection.query(stmt_reply2, item.user_no, function(err2, result2){
            if(err2) throw err2;
            else{
                item.userid = result2[0].id;
                item.username = result2[0].nickname;
                item.type = result2[0].type;
            }
        });
        
        connection.query(stmt_reply3, item.user_no, function(err3, result3){
            if(err3) throw err3;
            else{
                // console.log(result3.length);
                if(result3.length != 0) item.profile = result3[0].res_url;
            }
        });

        connection.query(stmt_reply4, item.id, function(err4, result4){
            if(err4) throw err4;
            else{
                if(result4.length != 0) item.totalLikeCount = result4.length;
                else item.totalLikeCount = 0;
            }
        });

        connection.query(stmt_reply5, item.id, function(err5, result5){
            if(err5) throw err5;
            else{
                if(result5.length != 0) item.yours = true;
                else item.yours = false;
            }
        });

        connection.query(stmt_reply6, [paramId, item.grp_no], function(err6, result6){
            if(err6) throw err6;
            else{
                if(result6.length != 0){

                    connection.query(stmt_reply2, result6[0].user_no, function(err7, result7){
                        if(err7) throw err7;
                        else{
                            item.reply.username = result7[0].nickname;
                            console.log('1111 item.reply.username : ', item.reply.username);
                            item.reply.type = result7[0].type;
                            console.log('2222 item.reply.type : ', item.reply.type);
                        }
                    });

                    connection.query(stmt_reply3, result6[0].user_no, function(err8, result8){
                        if(err8) throw err8;
                        else{
                            if( result8.length > 0 ) {
                                item.reply.profile = result8[0].res_url;
                            }

                            // item.reply.profile = result8[0].res_url;
                            console.log('3333 item.reply.profile : ', item.reply.profile);
                            item.reply.content = result6[0].content;
                            console.log('4444 item.reply.content : ', item.reply.content);
                            msg.push(item);
                            doneCallback(null);
                        }
                    });

                }
                else{
                    console.log('ELSE result6 null');
                    item.reply = null;
                    msg.push(item);
                    doneCallback(null);
                }

                // msg.push(item);
            }
            // doneCallback(null);
        });

    }
});

router.post('/contentdetail', function(req, res){

    console.log('\n\n****** /contentdetail ******', req.body.paramId);

    var msg = new Object();
    var paramId = req.body.paramId;

    var stmt_update1 = "update userboard set count = count + 1 where id like ?";
    var stmt_duplicated = "select count(`id`) as `cnt` from `userboard` where `id` = ?";
    var stmt_duplicated1 = "select * from userboard where id like ?";
    var stmt_duplicated2 = "select type, nickname from user where user_no like ?";
    var stmt_duplicated3 = "select res_url from resource where res_key like ? and res_kind like 'usrp'";
    var stmt_duplicated4 = "select res_url from resource where res_key like ? and res_kind like 'ub'";

    connection.query(stmt_duplicated, paramId, function(err0, result0) {
        if( err0 ) {
            console.log(err0);
            throw err0;
        }
        else {
            // 해당 게시글이 존재하지 않는다면
            if( result0[0].cnt == 0 ) {
                console.log("content detail has no this id: " + paramId);
                
                // var msg = new Object();

                msg.result = "not exists";
                msg = JSON.stringify(msg);
                res.send(msg);
            }
            else {
                connection.query(stmt_update1, paramId, function(err5, result5){
                    if(err5) throw err5;
                    else{
                        console.log('UPDATE :::::::: count = count + 1');
                    }
                });

                connection.query(stmt_duplicated1, paramId, function(err1, result1){
                    if(err1) throw err1;
                    else{
                        async.each(result1, childFunction, function(err){
                            if(err) throw err;
                            else{
                                // msg.push(result1);
                                console.log('msg : ', msg);
                                msg = JSON.stringify(msg);
                                res.send(msg);
                            } 
                            console.log('Success!!!!');
                        });
                    }
                });
            }
        }
    });

    function childFunction(item, doneCallback){
        item.type = "";
        item.nickname = "";
        item.profileSrc = "";
        item.resourceSrc = [];
        item.coords = JSON.parse(item.coords);

        var user_no = req.body.user_no;

        connection.query(stmt_duplicated2, item.user_no, function(err2, result2){
            if(err2) throw err2;
            else{
                item.type = result2[0].type;
                item.nickname = result2[0].nickname;
            }
        });

        connection.query(stmt_duplicated3, item.user_no, function(err3, result3){
            if(err3) throw err3;
            else{
                if( result3.length > 0 ) {
                    item.profileSrc = result3[0].res_url;
                }

                // item.profileSrc = result3[0].res_url;
                // item.profileSrc = result3[0].res_url;
            }
        });

        connection.query(stmt_duplicated4, item.id, function(err4, result4){
            if(err4) throw err4;
            else{
                if(result4 == null) item.resourceSrc.push(null);
                else{
                    result4.forEach(function(element) {
                        item.resourceSrc.push(element.res_url);
                        // item.resourceSrc.push(element.res_url);
                    });
                    // msg = item;
                    // console.log('item.resourceSrc : ', item.resourceSrc);
                }
            }
            // doneCallback(null);
        });

        // ######################################### 추가

        var user_no = req.body.user_no;
        if( user_no == null || user_no == 'undefined' ) user_no = -1;

        item.yours;
        item.totalLikeCount = 0;
        item.commentCount = 0;
        item.reply = {
            username: '',
            profile: '',
            content: '',
            type: ''
        }

        var stmt_yours = "select * from preference where ub_id like ? and user_no like ?"; // [item.id, user_no]
        var stmt_totalLikeCount = "select * from preference where ub_id like ?"; // item.id
        var stmt_commentCount = "select * from comment where ub_id like ? and level = 1"; // item.id
        var stmt_reply_1 = "select user_no, content from comment where ub_id like ? and level = 1 order by id desc limit 1"; // item.id
        var stmt_reply_2 = "select id, type, nickname from user where user_no like ?";
        var stmt_reply_3 = "select res_url from resource where res_key like ? and res_kind like 'usrp'";

        // var stmt_reply4 = "select * from commentpreference where c_id like ?";
        // var stmt_reply5 = "select * from commentpreference where c_id like ? and user_no = " + user_no;
        // var stmt_reply6 = "select user_no, content from comment where ub_id like ? and level = 2 and grp_no like ? order by id desc limit 1";

        connection.query(stmt_yours, [item.id, user_no], function(err, result){
            if(err) throw err;
            else{
                if(result.length != 0) item.yours = true;
                else item.yours = false;
            }
        });

        connection.query(stmt_totalLikeCount, item.id, function(err, result){
            if(err) throw err;
            else{
                if(result.length != 0) item.totalLikeCount = result.length;
                else item.totalLikeCount = 0;
            }
        });

        connection.query(stmt_commentCount, item.id, function(err, result){
            if(err) throw err;
            else{
                if(result.length != 0) item.commentCount = result.length;
                else item.commentCount = 0;
            }
        });

        connection.query(stmt_reply_1, item.id, function(err16, result16){
            if(err16) throw err16;
            else{
                if(result16.length != 0){

                    connection.query(stmt_reply_2, result16[0].user_no, function(err17, result17){
                        if(err17) throw err17;
                        else{
                            item.reply.username = result17[0].nickname;
                            console.log('1111 item.reply.username : ', item.reply.username);
                            item.reply.type = result17[0].type;
                            console.log('2222 item.reply.type : ', item.reply.type);
                        }
                    });

                    connection.query(stmt_reply_3, result16[0].user_no, function(err18, result18){
                        if(err18) throw err18;
                        else{
                            if( result18.length > 0 ) {
                                item.reply.profile = result18[0].res_url;
                            }

                            // item.reply.profile = result18[0].res_url;
                            console.log('3333 item.reply.profile : ', item.reply.profile);
                            item.reply.content = result16[0].content;
                            console.log('4444 item.reply.content : ', item.reply.content);
                            msg = item;
                            doneCallback(null);
                        }
                    });

                }
                else{
                    console.log('ELSE result6 null');
                    item.reply = null;
                    msg = item;
                    doneCallback(null);
                }

                // msg.push(item);
            }
            // doneCallback(null);
        });

        // #########################################
    }

});

router.post('/contentsearch', function(req, res){

    console.log('\n\n****** /contentsearch ******', req.body.keyword);

    // msg[0] : facility, msg[1] : userboard
    var msg = [];
    // var serverUrl = "http://192.168.0.33:3200/";
    // var serverUrl = "http://localhost:3200/";
    // var serverUrl = "http://192.168.43.178:3200/";
    // var serverUrl = "http://172.30.81.120:3200/";
    
    
    // var serverUrl = "http://192.168.0.14:3200/";
    var keyword = '%' + req.body.keyword + '%';

    // facilityboard logic
    // select * from facilityboard where name like '%중앙%';
    var stmt_facility1 = "select * from facilityboard where name like ?";
    // select res_url from resource where res_key like '1' and res_kind like 'fb'; 각 장소 게시판 내용의 리소스 이미지
    var stmt_facility2 = "select res_url from resource where res_key like ? and res_kind like 'fb'";

    connection.query(stmt_facility1, keyword, function(err1, result1){
        if(err1) throw err1;
        else{
            if(result1 != null){
                async.each(result1, childFacilityFunction, function(err){
                    if(err) throw err;
                    else{
                        exeUserboard();
                    }
                });
            }
            else{
                msg.push(null);
            }
        }
    });

    function childFacilityFunction(item, doneCallback){
        item.board = 'facilityboard';
        item.resourceSrc = [];

        connection.query(stmt_facility2, item.id, function(err2, result2){
            if(err2) throw err2;
            else{
                if(result2 == null) item.resourceSrc.push(null);
                else{
                    result2.forEach(function(element) {
                        item.resourceSrc.push(element.res_url);
                        // item.resourceSrc.push(element.res_url);
                    });
                    msg.push(item);
                    // console.log('item.resourceSrc : ', item.resourceSrc);
                }
            }
            doneCallback(null);
        });
    }

    // userboard logic
    function exeUserboard(){

        var stmt_user1 = "";
        var tagFlag = false;
        var tagKeyword = "";
        if( req.body.keyword != null ) tagFlag = req.body.keyword.includes("#");
        if( tagFlag ){
            console.log('\n\n\n\n\n# 있음!!!');
            var tagArray = req.body.keyword.split("#");
            console.log('tagArray.length : ', tagArray.length);

            for(var i = 1; i < tagArray.length; i++){
                console.log(i+'번째 tagArray 값 : ', tagArray[i]);
                if(i == tagArray.length - 1) tagKeyword += "'%" + tagArray[i] + "%'";
                else tagKeyword += "'%" + tagArray[i].replace(/(^\s*)|(\s*$)/gi, "") + "%' or tag like ";
            }

            console.log('검색 tagKeyword : ', tagKeyword);
            stmt_user1 = "select id, category, name, content, coords, regist_time, count, user_no, regist_time, tag from userboard where tag like " + tagKeyword + " and event != 'e' order by id desc";
            console.log("#keyword sql : ", stmt_user1);

            connection.query(stmt_user1, function(err1, result1){
                if(err1) throw err1;
                else{
                    if(result1 != null){
                        async.each(result1, childUserFunction, function(err){
                            if(err) throw err;
                            else{
                                console.log('msg : ', msg);
                                res.send(msg);
                            }
                            console.log('Success!!!!');
                        });
                    }
                    else{
                        msg.push(null);
                        res.send(msg);
                    }
                }
            });            
        }
        else{

            // select id, category, name, content, coords, regist_time, count, user_no, regist_time, tag from userboard where name like "%it%" or content like "%it%" order by id desc; 유저 게시판 내용
            stmt_user1 = "select id, category, name, content, coords, regist_time, count, user_no, regist_time, tag from userboard where name like ? or content like ? and event != 'e' order by id desc";

            connection.query(stmt_user1, [keyword, keyword], function(err1, result1){
                if(err1) throw err1;
                else{
                    if(result1 != null){
                        async.each(result1, childUserFunction, function(err){
                            if(err) throw err;
                            else{
                                console.log('msg : ', msg);
                                res.send(msg);
                            }
                            console.log('Success!!!!');
                        });
                    }
                    else{
                        msg.push(null);
                        res.send(msg);
                    }
                }
            });
        }
    }

    function childUserFunction(item, doneCallback){
        var stmt_user2 = "select type, nickname from user where user_no like ?";
        var stmt_user3 = "select res_url from resource where res_key like ? and res_kind like 'usrp'";
        var stmt_user4 = "select res_url from resource where res_key like ? and res_kind like 'ub'";

        item.board = 'userboard';
        item.type = "";
        item.nickname = "";
        item.profileSrc = "";
        item.resourceSrc = [];
        item.coords = JSON.parse(item.coords);

        connection.query(stmt_user2, item.user_no, function(err2, result2){
            if(err2) throw err2;
            else{
                item.type = result2[0].type;
                item.nickname = result2[0].nickname;
            }
        });

        connection.query(stmt_user3, item.user_no, function(err3, result3){
            if(err3) throw err3;
            else{
                if( result3.length > 0 ) {
                    item.profileSrc = result3[0].res_url;
                }

                // item.profileSrc = result3[0].res_url;
                // item.profileSrc = result3[0].res_url;
            }
        });

        connection.query(stmt_user4, item.id, function(err4, result4){
            if(err4) throw err4;
            else{
                if(result4 == null) item.resourceSrc.push(null);
                else{
                    result4.forEach(function(element) {
                        item.resourceSrc.push(element.res_url);
                        // item.resourceSrc.push(element.res_url);
                    });
                    // msg.push(item);
                    // console.log('item.resourceSrc : ', item.resourceSrc);
                }
            }
            // doneCallback(null);
        });

        // ######################################### 추가

        var user_no = req.body.user_no;
        if( user_no == null || user_no == 'undefined' ) user_no = -1;

        item.yours;
        item.totalLikeCount = 0;
        item.commentCount = 0;
        item.reply = {
            username: '',
            profile: '',
            content: '',
            type: ''
        }

        var stmt_yours = "select * from preference where ub_id like ? and user_no like ?"; // [item.id, user_no]
        var stmt_totalLikeCount = "select * from preference where ub_id like ?"; // item.id
        var stmt_commentCount = "select * from comment where ub_id like ? and level = 1"; // item.id
        var stmt_reply_1 = "select user_no, content from comment where ub_id like ? and level = 1 order by id desc limit 1"; // item.id
        var stmt_reply_2 = "select id, type, nickname from user where user_no like ?";
        var stmt_reply_3 = "select res_url from resource where res_key like ? and res_kind like 'usrp'";

        // var stmt_reply4 = "select * from commentpreference where c_id like ?";
        // var stmt_reply5 = "select * from commentpreference where c_id like ? and user_no = " + user_no;
        // var stmt_reply6 = "select user_no, content from comment where ub_id like ? and level = 2 and grp_no like ? order by id desc limit 1";

        connection.query(stmt_yours, [item.id, user_no], function(err, result){
            if(err) throw err;
            else{
                if(result.length != 0) item.yours = true;
                else item.yours = false;
            }
        });

        connection.query(stmt_totalLikeCount, item.id, function(err, result){
            if(err) throw err;
            else{
                if(result.length != 0) item.totalLikeCount = result.length;
                else item.totalLikeCount = 0;
            }
        });

        connection.query(stmt_commentCount, item.id, function(err, result){
            if(err) throw err;
            else{
                if(result.length != 0) item.commentCount = result.length;
                else item.commentCount = 0;
            }
        });

        connection.query(stmt_reply_1, item.id, function(err16, result16){
            if(err16) throw err16;
            else{
                if(result16.length != 0){

                    connection.query(stmt_reply_2, result16[0].user_no, function(err17, result17){
                        if(err17) throw err17;
                        else{
                            item.reply.username = result17[0].nickname;
                            console.log('1111 item.reply.username : ', item.reply.username);
                            item.reply.type = result17[0].type;
                            console.log('2222 item.reply.type : ', item.reply.type);
                        }
                    });

                    connection.query(stmt_reply_3, result16[0].user_no, function(err18, result18){
                        if(err18) throw err18;
                        else{
                            if( result18.length > 0 ) {
                                item.reply.profile = result18[0].res_url;
                            }

                            // item.reply.profile = result18[0].res_url;
                            console.log('3333 item.reply.profile : ', item.reply.profile);
                            item.reply.content = result16[0].content;
                            console.log('4444 item.reply.content : ', item.reply.content);
                            msg.push(item);
                            doneCallback(null);
                        }
                    });

                }
                else{
                    console.log('ELSE result6 null');
                    item.reply = null;
                    msg.push(item);
                    doneCallback(null);
                }

                // msg.push(item);
            }
            // doneCallback(null);
        });

        // #########################################
    }

}); 

router.post('/category', function(req, res){
    console.log('\n\n****** /category ******', req.body.type + " : " + req.body.keyword + ", " + req.body.categorys);

    // msg[0] : facility, msg[1] : userboard
    var msg = [];
    // var serverUrl = "http://192.168.0.33:3200/";
    // var serverUrl = "http://localhost:3200/";
    // var serverUrl = "http://192.168.43.178:3200/"; 
    // var serverUrl = "http://172.30.81.120:3200/";

    var user_no = (req.body.user_no == null || req.body.user_no == undefined)? -1: req.body.user_no;

    
    // var categorys = req.body.categorys;
    var categorys = req.body.categorys;
    var categorysText = "";
    for(var i = 0; i < categorys.length; i++){
        if(i+1 != categorys.length){
            categorysText += "'" + categorys[i] + "',";
        }
        else{
            categorysText += "'" + categorys[i] + "'"
        }
    }

    // select id, category, name, content, coords, regist_time, count, user_no, regist_time from userboard where category in('이벤트','일상') order by regist_time desc;
    var stmt_duplicated1 = "";
    if(categorysText == "" || categorysText == null){
        stmt_duplicated1 = "select id, category, name, content, coords, regist_time, count, user_no, regist_time, tag from userboard where category in('') and event != 'e' order by id desc";
    }
    else if((categorysText != "" || categorysText != null) && req.body.type == 'non-search'){
        stmt_duplicated1 = "select id, category, name, content, coords, regist_time, count, user_no, regist_time, tag from userboard where category in(" + categorysText + ") and event != 'e' order by id desc";
    }
    else if((categorysText != "" || categorysText != null) && req.body.type == 'search'){
        stmt_duplicated1 = "select id, category, name, content, coords, regist_time, count, user_no, regist_time, tag from userboard where category in(" + categorysText + ") and name like '%" + req.body.keyword + "%' and event != 'e' order by id desc";
    }
    var stmt_duplicated2 = "select type, nickname from user where user_no like ?";
    var stmt_duplicated3 = "select res_url from resource where res_key like ? and res_kind like 'usrp'";
    var stmt_duplicated4 = "select res_url from resource where res_key like ? and res_kind like 'ub'";

    console.log('stmt_duplicated1 : ', stmt_duplicated1);

    connection.query(stmt_duplicated3, user_no, function(err, result) {
        if( err ) {
            throw err;
        } 
        else {
            if( result.length > 0 ) {
                msg.push({myProfileSrc: result[0].res_url});
            }
            else {
                msg.push({myProfileSrc: null});
            }

            connection.query(stmt_duplicated1, function(err1, result1){
                if(err1) throw err1;
                else{
                    async.each(result1, childFunction, function(err){
                        console.log('result1 : ', result1);
                        if(err) throw err;
                        else{
                            // msg.push(result1);
                            console.log('msg : ', msg);

                            res.send(msg);
                        } 
                        console.log('Success!!!!');
                    });
                }
            });
        }
    });

    function childFunction(item, doneCallback){
        item.type = "";
        item.nickname = "";
        item.profileSrc = "";
        item.resourceSrc = [];
        item.coords = JSON.parse(item.coords);

        connection.query(stmt_duplicated2, item.user_no, function(err2, result2){
            if(err2) throw err2;
            else{
                item.type = result2[0].type;
                item.nickname = result2[0].nickname;
            }
        });

        connection.query(stmt_duplicated3, item.user_no, function(err3, result3){
            if(err3) throw err3;
            else{
                if( result3.length > 0 ) {
                    item.profileSrc = result3[0].res_url;
                }

                // item.profileSrc = result3[0].res_url;
                // item.profileSrc = result3[0].res_url;
            }
        });

        connection.query(stmt_duplicated4, item.id, function(err4, result4){
            if(err4) throw err4;
            else{
                if(result4 == null) item.resourceSrc.push(null);
                else{
                    result4.forEach(function(element) {
                        item.resourceSrc.push(element.res_url);
                        // item.resourceSrc.push(element.res_url);
                    });
                    // msg.push(item);
                    // console.log('item.resourceSrc : ', item.resourceSrc);
                }
            }
            // doneCallback(null);
        });

        // ######################################### 추가

        var user_no = req.body.user_no;
        if( user_no == null || user_no == 'undefined' ) user_no = -1;

        item.yours;
        item.totalLikeCount = 0;
        item.commentCount = 0;
        item.reply = {
            username: '',
            profile: '',
            content: '',
            type: ''
        }

        var stmt_yours = "select * from preference where ub_id like ? and user_no like ?"; // [item.id, user_no]
        var stmt_totalLikeCount = "select * from preference where ub_id like ?"; // item.id
        var stmt_commentCount = "select * from comment where ub_id like ? and level = 1"; // item.id
        var stmt_reply_1 = "select user_no, content from comment where ub_id like ? and level = 1 order by id desc limit 1"; // item.id
        var stmt_reply_2 = "select id, type, nickname from user where user_no like ?";
        var stmt_reply_3 = "select res_url from resource where res_key like ? and res_kind like 'usrp'";

        // var stmt_reply4 = "select * from commentpreference where c_id like ?";
        // var stmt_reply5 = "select * from commentpreference where c_id like ? and user_no = " + user_no;
        // var stmt_reply6 = "select user_no, content from comment where ub_id like ? and level = 2 and grp_no like ? order by id desc limit 1";

        connection.query(stmt_yours, [item.id, user_no], function(err, result){
            if(err) throw err;
            else{
                if(result.length != 0) item.yours = true;
                else item.yours = false;
            }
        });

        connection.query(stmt_totalLikeCount, item.id, function(err, result){
            if(err) throw err;
            else{
                if(result.length != 0) item.totalLikeCount = result.length;
                else item.totalLikeCount = 0;
            }
        });

        connection.query(stmt_commentCount, item.id, function(err, result){
            if(err) throw err;
            else{
                if(result.length != 0) item.commentCount = result.length;
                else item.commentCount = 0;

                msg.push(item);
                doneCallback(null);
            }
        });

        // connection.query(stmt_reply_1, item.id, function(err16, result16){
        //     if(err16) throw err16;
        //     else{
        //         if(result16.length != 0){

        //             connection.query(stmt_reply_2, result16[0].user_no, function(err17, result17){
        //                 if(err17) throw err17;
        //                 else{
        //                     item.reply.username = result17[0].nickname;
        //                     console.log('1111 item.reply.username : ', item.reply.username);
        //                     item.reply.type = result17[0].type;
        //                     console.log('2222 item.reply.type : ', item.reply.type);
        //                 }
        //             });

        //             connection.query(stmt_reply_3, result16[0].user_no, function(err18, result18){
        //                 if(err18) throw err18;
        //                 else{
        //                     if( result18.length > 0 ) {
        //                         item.reply.profile = result18[0].res_url;
        //                     }

        //                     // item.reply.profile = result18[0].res_url;
        //                     console.log('3333 item.reply.profile : ', item.reply.profile);
        //                     item.reply.content = result16[0].content;
        //                     console.log('4444 item.reply.content : ', item.reply.content);
        //                     // console.log("ub_id: ", item.id);
        //                     msg.push(item);
        //                     doneCallback(null);
        //                 }
        //             });

        //         }
        //         else{
        //             console.log('ELSE result6 null');
        //             item.reply = null;
        //             msg.push(item);
        //             doneCallback(null);
        //         }

        //         // msg.push(item);
        //     }
        //     // doneCallback(null);
        // });

        // #########################################
    }
});

router.post('/homecontent', function(req, res){

    console.log('\n\n****** /homecontent ******');

    // select id, category, name, regist_time, count, user_no from userboard order by regist_time desc; 유저 게시판 내용
    var stmt_duplicated1 = "select id, category, name, content, coords, regist_time, count, user_no, regist_time, tag from userboard where event != 'e' order by id desc";
    // select nickname from user where user_no like 1; 각 유저 게시판 내용의 닉네임
    var stmt_duplicated2 = "select type, nickname from user where user_no like ?";
    // select res_url from resource where res_key like 1; 각 유저 게시판 내용의 유저 프로필
    var stmt_duplicated3 = "select res_url from resource where res_key like ? and res_kind like 'usrp'";
    // select res_url from resource where res_key like '0000000001' and res_kind like 'ub'; 각 유저 게시판 내용의 리소스 이미지
    var stmt_duplicated4 = "select res_url from resource where res_key like ? and res_kind like 'ub'";


    var user_no = (req.body.user_no == null || req.body.user_no == undefined)? -1: req.body.user_no;

    var msg = [];
    // var serverUrl = "http://localhost:3200/";
    // var serverUrl = "http://192.168.0.14:3200/";
    // var serverUrl = "http://192.168.43.178:3200/";
    // var serverUrl = "http://192.168.0.33:3200/";
    // var serverUrl = "http://172.30.81.120:3200/";

    connection.query(stmt_duplicated3, user_no, function(err, result) {
        if( err ) {
            throw err;
        } 
        else {
            if( result.length > 0 ) {
                msg.push({myProfileSrc: result[0].res_url});
            }
            else {
                msg.push({myProfileSrc: null});
            }
            
            connection.query(stmt_duplicated1, function(err1, result1){
                if(err1) throw err1;
                else{
                    async.each(result1, childFunction, function(err){
                        if(err) throw err;
                        else{
                            // msg.push(result1);
                            console.log('msg : ', msg);

                            res.send(msg);
                        } 
                        console.log('Success!!!!');
                    });
                }
            });
        }
    });

    function childFunction(item, doneCallback){
        item.type = "";
        item.nickname = "";
        item.profileSrc = "";
        item.resourceSrc = [];
        item.coords = JSON.parse(item.coords);

        connection.query(stmt_duplicated2, item.user_no, function(err2, result2){
            if(err2) throw err2;
            else{
                item.type = result2[0].type;
                item.nickname = result2[0].nickname;
            }
        });

        connection.query(stmt_duplicated3, item.user_no, function(err3, result3){
            if(err3) throw err3;
            else{
                if( result3.length > 0 ) {
                    item.profileSrc = result3[0].res_url;
                }

                // item.profileSrc = result3[0].res_url;
                // item.profileSrc = result3[0].res_url;
            }
        });

        connection.query(stmt_duplicated4, item.id, function(err4, result4){
            if(err4) throw err4;
            else{
                if(result4 == null) item.resourceSrc.push(null);
                else{
                    result4.forEach(function(element) {
                        item.resourceSrc.push(element.res_url);
                        // item.resourceSrc.push(element.res_url);
                    });
                    // msg.push(item);
                    // console.log('item.resourceSrc : ', item.resourceSrc);
                }
            }
            // doneCallback(null);
        });

        // ######################################### 추가

        var user_no = req.body.user_no;
        if( user_no == null || user_no == 'undefined' ) user_no = -1;

        item.yours;
        item.totalLikeCount = 0;
        item.commentCount = 0;
        item.reply = {
            username: '',
            profile: '',
            content: '',
            type: ''
        }

        var stmt_yours = "select * from preference where ub_id like ? and user_no like ?"; // [item.id, user_no]
        var stmt_totalLikeCount = "select * from preference where ub_id like ?"; // item.id
        var stmt_commentCount = "select * from comment where ub_id like ? and level = 1"; // item.id
        var stmt_reply_1 = "select user_no, content from comment where ub_id like ? and level = 1 order by id desc limit 1"; // item.id
        var stmt_reply_2 = "select id, type, nickname from user where user_no like ?";
        var stmt_reply_3 = "select res_url from resource where res_key like ? and res_kind like 'usrp'";

        // var stmt_reply4 = "select * from commentpreference where c_id like ?";
        // var stmt_reply5 = "select * from commentpreference where c_id like ? and user_no = " + user_no;
        // var stmt_reply6 = "select user_no, content from comment where ub_id like ? and level = 2 and grp_no like ? order by id desc limit 1";

        connection.query(stmt_yours, [item.id, user_no], function(err, result){
            if(err) throw err;
            else{
                if(result.length != 0) item.yours = true;
                else item.yours = false;
            }
        });

        connection.query(stmt_totalLikeCount, item.id, function(err, result){
            if(err) throw err;
            else{
                if(result.length != 0) item.totalLikeCount = result.length;
                else item.totalLikeCount = 0;
            }
        });

        connection.query(stmt_commentCount, item.id, function(err, result){
            if(err) throw err;
            else{
                if(result.length != 0) item.commentCount = result.length;
                else item.commentCount = 0;
            }
            msg.push(item);
            doneCallback(null);
        });

        // #########################################
    }
});

router.post('/contentdelete', function(req, res){
    
    console.log('\n\n****** /contentdelete ******', 'paramId : ' + req.body.paramId);

    var paramId = req.body.paramId;
    var res_kind = req.body.res_kind;
    var resourceSrc = req.body.resourceSrc;

    console.log("paramId", paramId);
    console.log("res_kind", res_kind);
    console.log("resourceSrc", resourceSrc);

    var stmt_delete = "delete from userboard where id like ?";

    connection.query(stmt_delete, paramId, function(err, result){
        if(err) {
            console.log("fail");
            res.json("fail");
            throw err;
        }
        else {

            // 리소스가 존재하면
            if( resourceSrc.length > 0 ) {
                var stmt_duplicated = "delete from `resource` where `res_kind` = ? and `res_key` = ?";

                connection.query(stmt_duplicated, [res_kind, paramId], function(err1, result1) {
                    if( err1 ) {
                        console.log(err1);
                        throw err1;
                    }
                    else {
                        console.log("Resource Table remove Complete!!");

                        // 실제 파일 삭제
                        resourceSrc.forEach((element) => {
                            var fileFullPath = getDirname(1) + element;
                            // var fileFullPath = 'res\\' + res_type + 's\\' + res_kind + '\\' + res_key + "_" + fileIndex;
                            // fileFullPath += (res_type == 'image')? '.jpeg': '';

                            console.log(fileFullPath);

                            fs.exists(fileFullPath, function (exists) { 

                                if( exists ) {
                                    console.log("It's there");

                                    fs.unlink(fileFullPath, function (err) { 
                                        if( err ) {
                                            throw err;
                                        }
                                        else {
                                            console.log('successfully deleted ' + fileFullPath);
                                        }
                                    });
                                }
                                else {
                                    console.log("no exists!"); 
                                }
                            });
                        });

                        res.json('success');
                    }
                });
            }
            else {
                console.log("success");
                res.json("success");
            }
        }
    });

});

router.post('/busboard', function(req, res){

    console.log('\n\n****** /busboard ******');

    var msg = [];

    var stmt_busboard = "select * from busboard";

    connection.query(stmt_busboard, function(err, result){
        if(err) throw err;
        else{
            msg.push(result);
            
            console.log('msg : ', msg);
            res.send(msg)
        }
    });

});


/*********************************************************************************************************************************/



 // 이미지파일 호스팅 로직 
router.get('/res/images/background/:name', function(req, res) {   

    var filename = req.params.name;  
    var imagePath = __dirname.substring(0, __dirname.length - 7) + "/res/images/background/";

    console.log(imagePath + filename);
    
    // 파일의 존재여부 확인후 이미지 반환
    fs.exists(imagePath + filename, function(exists) {
        if (exists) {
            fs.readFile(imagePath + filename, function(err, data) {
                res.end(data);
            });
        } 
        else {
            res.end('file is not exists');
        }
    });
});

router.get('/res/images/profile/:name', function(req, res) {   

    var filename = req.params.name;  
    var imagePath = __dirname.substring(0, __dirname.length - 7) + "/res/images/profile/";

    console.log(imagePath + filename);
    
    // 파일의 존재여부 확인후 이미지 반환
    fs.exists(imagePath + filename, function(exists) {
        if (exists) {
            fs.readFile(imagePath + filename, function(err, data) {
                // res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
                // res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
                res.end(data);                
                // res.end(data + "?v=" + Date.now());
            });
        } 
        else {
            res.end('file is not exists');
        }
    });
});

router.get('/res/images/facilityboard/:name', function(req, res) {   

    var filename = req.params.name;  
    var imagePath = __dirname.substring(0, __dirname.length - 7) + "/res/images/facilityboard/";

    console.log(imagePath + filename);
    
    // 파일의 존재여부 확인후 이미지 반환
    fs.exists(imagePath + filename, function(exists) {
        if (exists) {
            fs.readFile(imagePath + filename, function(err, data) {
                res.end(data);
            });
        } 
        else {
            res.end('file is not exists');
        }
    });
});

router.get('/res/images/userboard/:name', function(req, res) {   

    var filename = req.params.name;  
    var imagePath = __dirname.substring(0, __dirname.length - 7) + "/res/images/userboard/";

    console.log(imagePath + filename);
    
    // 파일의 존재여부 확인후 이미지 반환
    fs.exists(imagePath + filename, function(exists) {
        if (exists) {
            fs.readFile(imagePath + filename, function(err, data) {
                res.end(data);
            });
        } 
        else {
            res.end('file is not exists');
        }
    });
});

module.exports = router;
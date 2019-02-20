import { Component } from "@angular/core";
import {
  ActionSheetController,
  IonicPage,
  NavController,
  NavParams,
  ViewController
} from "ionic-angular";
import { File } from "@ionic-native/file";
import { Transfer } from "@ionic-native/transfer";
import { Camera } from "@ionic-native/camera";

// pages
import { UserInfo } from "../user-info/user-info";

// provider
import { ServerRequester } from "../../providers/server-requester";
import { UploadHandler } from "../../providers/upload-handler";

/**
 * Generated class for the UserInfoUpdate page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

/*
2017.07.03 made by Youngwuk Jeon

  <Update Log>
*/

declare var cordova: any;

@IonicPage()
@Component({
  selector: "page-user-info-update",
  templateUrl: "user-info-update.html"
})
export class UserInfoUpdate {
  private userinfo: any = {
    nickname: "",
    bgImg: "assets/image/bg_gray.png",
    profileImg: "assets/image/bg_gray.png",
    type: "",
    gender: "",
    genderChecked: false,
    birth: "",
    birthChecked: false,
    age: "",
    info: "",
    intro: "",
    pw: ""
  };

  private user_no: number;
  private oldPw: string = "";
  private newPw: string = "";
  private newPwConfirm: string = "";
  private imgs: any[] = []; // 업로드할 이미지를 저장하는 배열

  // private original_profileImg: string = null;
  // private original_bgImg: string = null;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private viewCtrl: ViewController,
    public asCtrl: ActionSheetController,
    private file: File,
    private transfer: Transfer,
    private camera: Camera,
    private sevReq: ServerRequester,
    private ulh: UploadHandler
  ) {
    this.user_no = this.navParams.get("user_no");
    // this.userinfo = this.navParams.get('userinfo');

    // this.user_no = 1;

    this.userinfo.nickname = this.navParams.get("userinfo").nickname;
    this.userinfo.bgImg = this.navParams.get("userinfo").bgImg;
    this.userinfo.profileImg = this.navParams.get("userinfo").profileImg;
    this.userinfo.type = this.navParams.get("userinfo").type;
    this.userinfo.gender = this.navParams.get("userinfo").gender;
    this.userinfo.birth = this.navParams.get("userinfo").birth;
    this.userinfo.age = this.navParams.get("userinfo").age;
    this.userinfo.info = this.navParams.get("userinfo").info;
    this.userinfo.intro = this.navParams.get("userinfo").intro;
    this.userinfo.pw = this.navParams.get("userinfo").pw;

    this.userinfo.info = this.userinfo.info.split(";");
    this.userinfo.gender =
      this.userinfo.gender != null
        ? this.userinfo.gender == "남성"
          ? "male"
          : "female"
        : null;
    this.userinfo.birth =
      this.userinfo.birth != null
        ? this.userinfo.birth.substring(0, 4) +
          "-" +
          this.userinfo.birth.substring(6, 8) +
          "-" +
          this.userinfo.birth.substring(10, 12)
        : null;

    var tempInfo = [];

    this.userinfo.info.forEach(element => {
      if (element.trim() != "") {
        tempInfo.push({
          content: element
        });
      }
    });

    this.userinfo.info = tempInfo;

    console.log(this.userinfo);

    // this.original_profileImg = this.userinfo.profile;
    // this.original_bgImg = this.userinfo.bgImg;

    this.imgs.push({
      src: this.userinfo.profileImg,
      hasImg: false,
      serverImg: false,
      original_path: this.userinfo.profileImg,
      imgNewPath: "",
      res_type: "image",
      res_kind: "usrp"
    });

    this.imgs.push({
      src: this.userinfo.bgImg,
      hasImg: false,
      // serverImg: false,
      original_path: this.userinfo.bgImg,
      imgNewPath: "",
      res_type: "image",
      res_kind: "usrb"
    });
  }

  callback(domainURL: string, link: string, data: any) {
    if (link == "userinfoupdate") {
      var flag_img = false;

      this.imgs.some(element => {
        // if( element.hasImg && !element.src.includes('assets/image/') ) {
        if (element.hasImg) {
          flag_img = true;
          return true;
        }
      });

      // 이미지가 존재할 경우
      if (flag_img) {
        console.log("image upload");
        this.ulh.uploadPhoto(this.imgs, "multi", null, this.user_no, this);
      } else {
        console.log("No Have Image!!");
        console.log("id: ", data);

        alert("유저 정보가 변경되었습니다.");
        this.navCtrl.push(UserInfo, { user_no: this.user_no });
        this.navCtrl.remove(0, 2);
      }
    } else if (link == "upload") {
      if (data == "fail") {
        console.log("upload fail!!");
        alert("업로드에 실패했습니다.");
        return;
      }

      console.log("id: ", data);
      alert("유저 정보가 변경되었습니다.(이미지 포함)");
      this.navCtrl.push(UserInfo, { user_no: this.user_no });
      this.navCtrl.remove(0, 2);
    }
  }

  // 정보 제거
  removeItem(item) {
    this.userinfo.info.splice(this.userinfo.info.indexOf(item), 1);
  }

  // 정보 추가
  addItem() {
    this.userinfo.info.push({
      content: ""
    });
  }

  chooseImage(img) {
    let asCtrl = this.asCtrl.create({
      title: "Choose Picture Source",
      buttons: [
        {
          text: "Gallery",
          icon: "albums",
          handler: () => {
            this.actionHandler(1, img);
          }
        },
        {
          text: "Camera",
          icon: "camera",
          handler: () => {
            this.actionHandler(2, img);
          }
        },
        {
          text: "Cancel",
          role: "cancel",
          handler: () => {
            console.log("Cancel clicked");
          }
        }
      ]
    });

    asCtrl.present();

    // this.pmSer.checkCameraPermissions().then(permissionOk => {
    //   alert(permissionOk);
    //   if (permissionOk) {
    //     alert('awesome!');
    //   }
    //   else {
    //     alert('balls.');
    //   }
    // });
  }

  actionHandler(selection: any, img: any) {
    var options: any;

    // this.camera.cleanup();

    if (selection == 1) {
      options = {
        quality: 75,
        mediaType: this.camera.MediaType.PICTURE,
        destinationType: this.camera.DestinationType.FILE_URI,
        sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
        allowEdit: true,
        encodingType: this.camera.EncodingType.JPEG,
        targetWidth: 1500,
        targetHeight: 1500,
        saveToPhotoAlbum: false
      };
    } else {
      options = {
        quality: 75,
        mediaType: this.camera.MediaType.PICTURE,
        destinationType: this.camera.DestinationType.FILE_URI,
        sourceType: this.camera.PictureSourceType.CAMERA,
        allowEdit: true,
        encodingType: this.camera.EncodingType.JPEG,
        targetWidth: 1500,
        targetHeight: 1500,
        saveToPhotoAlbum: false
      };
    }

    this.camera.getPicture(options).then((imageUrl: string) => {
      var sourceDirectory = imageUrl.substring(
        0,
        imageUrl.lastIndexOf("/") + 1
      );
      var sourceFileName = imageUrl.substring(
        imageUrl.lastIndexOf("/") + 1,
        imageUrl.length
      );
      var realPath = sourceFileName;

      sourceFileName = sourceFileName.split("?").shift();
      realPath = sourceFileName;

      if (imageUrl.includes("?")) {
        realPath =
          imageUrl.split("?").pop() +
          "." +
          imageUrl
            .split("?")
            .shift()
            .split(".")
            .pop();
      }

      this.file
        .copyFile(
          sourceDirectory,
          sourceFileName,
          cordova.file.externalApplicationStorageDirectory,
          realPath
        )
        .then(
          (result: any) => {
            // this.userinfo.profileImg = imageUrl;
            img.src = imageUrl;
            img.hasImg = true;
            img.serverImg = true;
            img.imgNewPath = result.nativeURL;
            img.res_type = "image";
          },
          err => {
            alert(JSON.stringify(err));
          }
        );
    });
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad UserInfo");
  }

  update() {
    if (this.userinfo.nickname.trim() == "") {
      console.log("닉네임을 입력해주세요.");
      return;
    }

    if (
      this.oldPw != null &&
      this.oldPw.trim().length > 0 &&
      this.userinfo.pw.trim() != this.oldPw.trim()
    ) {
      console.log("현재 비밀번호 틀림");
      return;
    }

    if (
      this.oldPw != null &&
      this.oldPw.trim().length > 0 &&
      (this.newPw == null ||
        this.newPwConfirm == null ||
        this.newPw.trim().length == 0 ||
        this.newPw.trim() != this.newPwConfirm.trim())
    ) {
      console.log("새로운 비밀번호 확인 필요");
      return;
    }

    let sendData = {
      user_no: this.user_no,
      nickname: this.userinfo.nickname.trim(),
      bgImg: this.userinfo.bgImg,
      profileImg: this.userinfo.profileImg,
      gender: this.userinfo.genderChecked ? null : this.userinfo.gender,
      birth: this.userinfo.birthChecked ? null : this.userinfo.birth,
      intro: this.userinfo.intro.trim(),
      info: this.userinfo.info,
      newPw: this.newPw.trim(),
      changePw: false
    };

    var tempInfo = "";

    sendData.info.forEach(element => {
      if (element.content.trim() != "") {
        tempInfo += element.content.trim() + ";";
      }
    });

    if (tempInfo.trim().length > 0) {
      tempInfo.substring(0, tempInfo.length - 1);
    }

    sendData.info = tempInfo;

    if (this.oldPw != null && this.oldPw.trim().length > 0) {
      sendData.changePw = true;
    }

    console.log("sendData: ", sendData);

    this.sevReq.getResult("userinfoupdate", sendData, this);
  }

  cancel() {
    this.navCtrl.pop();
  }
}

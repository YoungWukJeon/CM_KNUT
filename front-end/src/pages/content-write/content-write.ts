import { Component, ViewChild } from '@angular/core';
import { ActionSheetController, IonicPage, NavController, NavParams, AlertController, ModalController } from 'ionic-angular';
// import { File, Transfer, Camera } from 'ionic-native';
import { File } from '@ionic-native/file';
import { Transfer } from '@ionic-native/transfer';
import { Camera } from '@ionic-native/camera';
import { PhotoViewer } from '@ionic-native/photo-viewer';

//  pages
import { ContentWriteSub } from '../content-write-sub/content-write-sub';
import { ContentDetail } from '../content-detail/content-detail';

// provider
import { ServerRequester } from '../../providers/server-requester';
import { LocalStorage } from '../../providers/local-storage';
import { UploadHandler } from '../../providers/upload-handler'
import { PermissionsService } from '../../providers/permissions-service';


/**
 * Generated class for the ContentWrite page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

/*
2017.05.12 made by Youngwuk Jeon

  <Update Log>
    [2017.06.05]
      1. 파일 업로드 부분 추가
    [2017.06.06]
      1. 전송할 내용 체크 및 전송
    [2017.07.05]
      1. 게시글 수정을 할 경우의 로직 추가
  
*/

declare var cordova: any;

@IonicPage()
@Component({
  selector: 'page-content-write',
  templateUrl: 'content-write.html',
})
export class ContentWrite {

  @ViewChild('map') map;

  private markerContent: string = "장소에 마커를 찍어주세요."; // 마커가 찍혀있을 때에 따른 표시 글
  private flag_mi: boolean = false; // 지도가 로드되었는지의 여부(mi : mapInit)
  private flag_sm: boolean = false; // 지도가 보여지는지의 여부(sm : showMap)
  private flag_ap: boolean = false; // 마커 핀의 활성화 여부(ap : activePin)

  private maxMarkerCount: number = 5;  // 지도에 찍을 수 있는 최대 마커의 수(현재 5개)
  private maxUploadCount: number = 5;  // 업로드 할 수 있는 최대 파일의 수(현재 5개)

  private markers: Marker[] = []; // 마커를 저장하는 배열
  private categoryBtns: any[];  // 게시글의 분류 버튼을 저장하는 배열
  // private tags: any[];  // 태그들을 저장하는 배열
  private imgs: any[] = [];  // 업로드할 이미지를 저장하는 배열

  private title: string = ""; // 게시글 제목
  private category: string = "";  // 게시글 분류
  private expireDate; // 게시글 만료시간
  private tagContent: string = ""; // 태그 input에 들어가는 내용
  private content: string = "";  // 본문에 들어가는 내용
  private subContent: any = null;  // 추가 기능이 들어가는 내용

  private mode: string = null;  // 게시글을 수정하는 중인지 확인
  private hasSubContent: boolean = false; // 수정 중인 게시글이 subcontent를 가지고 있는지 여부
  private subContentChanged: boolean = false; // 수정 중인 게시글의 subcontent가 삭제되거나 새로 추가되었을 경우
  private imgChanged: boolean = false;  // 수정 중인 게시글의 이미지가 바뀌었는지 여부
  private originalImageCount: number = 0; // 수정 전의 이미지 개수
  private changedImageCount: number = 0;  // 수정 후의 이미지 개수
  private postId: number = null;  // 해당 게시글의 아이디

  constructor(public navCtrl: NavController, public navParams: NavParams, private alertCtrl: AlertController, 
  public modalCtrl: ModalController, public asCtrl: ActionSheetController,
  private file: File, private transfer: Transfer, private camera: Camera, private photoViewer: PhotoViewer,
  private sevReq: ServerRequester, private localStorage: LocalStorage, private pmSer: PermissionsService, private ulh: UploadHandler) {

    this.mode = this.navParams.get('mode');

    // 마커 초기화
    for(var i = 0; i < this.maxMarkerCount; i++) {
      this.markers[i] = new Marker();
    }

    // 카테고리 버튼 초기화
    this.categoryBtns = [
      {name: "공지",
      defaultColor: "darkLight",
      color: "customBtn2",
      selected: false},
      {name: "이벤트",
      defaultColor: "darkLight",
      color: "customBtn3",
      selected: false},
      {name: "일상",
      defaultColor: "darkLight",
      color: "customBtn4",
      selected: false},
      {name: "건의",
      defaultColor: "darkLight",
      color: "customBtn5",
      selected: false}
    ];

    // 글쓰기 수정의 경우
    if( this.mode == 'update' ) {
      console.log("getItem() -> ", this.navParams.get('item'));

      var tempItem = this.navParams.get('item');

      tempItem.markers.forEach((element) => {
        this.markers[tempItem.markers.indexOf(element)].setLat(element.lat);
        this.markers[tempItem.markers.indexOf(element)].setLng(element.lng);
        this.markers[tempItem.markers.indexOf(element)].setVisibility(true);
      });
      
      this.postId = tempItem.id;
      this.markerContent = "위치등록이 완료되었습니다.";

      this.title = tempItem.title;

      this.categoryBtns.some((element) => {
        if( element.name == tempItem.category ) {
          element.selected = true;
          this.category = element.name;
          return true;
        }
      });

      if( tempItem.category == '이벤트' ) {
        this.expireDate = new Date(tempItem.expireTime).toISOString();
      }
      
      this.tagContent = tempItem.tag;
      this.content = tempItem.content;
      
      tempItem.resourceSrc[0].forEach((element) => {
        this.imgs.push({
          src: element,
          hasImg: true,
          original_path: element,
          imgNewPath: element,
          res_type: "image"
        });
        this.originalImageCount++;
      });

      if( this.imgs.length < 5 ) {
        this.imgs.push({
          src: "",
          hasImg: false,
          original_path: "",
          imgNewPath: "",
          res_type: ""
        });
      }
      if( tempItem.sub_content != null ) {
        this.hasSubContent = true;
        this.sevReq.getResult("subcontenttitle", {ub_id: tempItem.id}, this);
      }
    }
    else {
      this.imgs.push({
        src: "",
        hasImg: false,
        original_path: "",
        imgNewPath: "",
        res_type: ""
      });
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ContentWrite');
  }

  chooseImage(img) {

    let asCtrl = this.asCtrl.create({
      title: 'Choose Picture Source',
      buttons: [
        {
          text: 'Gallery',
          icon: 'albums',
          handler: () => {
            this.actionHandler(1, img);
          }
        },
        {
          text: 'Camera',
          icon: 'camera',
          handler: () => {
            this.actionHandler(2, img);
          }
        },
        {
          text: "Cancel",
          role: 'cancel',
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

    if( selection == 1 ) {
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
    }
    else {
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
      
      var sourceDirectory = imageUrl.substring(0, imageUrl.lastIndexOf('/') + 1);
      var sourceFileName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1, imageUrl.length);
      var realPath = sourceFileName;

      sourceFileName = sourceFileName.split('?').shift();
      realPath = sourceFileName;

      if( imageUrl.includes('?') ) {
        realPath = imageUrl.split('?').pop() + "." + imageUrl.split('?').shift().split('.').pop();
      }
    
      this.file.copyFile(sourceDirectory, sourceFileName, cordova.file.externalApplicationStorageDirectory, realPath).then((result: any) => {

        // img.src = imageUrl + "?v=" + Date.now();
        img.src = imageUrl;
        img.hasImg = true;
        // img.imgNewPath = result.nativeURL + "?v=" + Date.now();
        img.imgNewPath = result.nativeURL;
        img.res_type = "image";
        this.imgChanged = true;

        if( this.getImageCount() < this.maxUploadCount ) {
          this.imgs.push({
            src: "",
            hasImg: false,
            original_path: "",
            imgNewPath: "",
            res_type: ""
          });
        }
      }, (err) => {
        alert(JSON.stringify(err));
      })
    });
  }

  modifyImg(img) {
    console.log("click event!!");

    if( !img.hasImg ) {
      this.chooseImage(img);
    }
    else {
      // 이미지를 확대해서 보여줌
      // let bigImageModal = this.modalCtrl.create(BigImage, {img: img});
      // bigImageModal.present();
      // alert(img.imgNewPath);
      this.photoViewer.show(img.imgNewPath, "이미지 확대", {share: true});
    }
  }

  removeImg(img) {
    console.log("press event!!");
    // img.src = "";
    // img.hasImg = false;

    if( this.getImageCount() >= 1 ) {
      img.src = "";
      img.hasImg = false;
      img.imgNewPath = "";
      img.res_type = "";
      this.imgs.splice(this.imgs.indexOf(img), 1);
      this.imgChanged = true;

      if( this.getImageCount() == this.maxUploadCount - 1 ) {
          this.imgs.push({
          src: "",
          hasImg: false,
          original_path: "",
          imgNewPath: "",
          res_type: ""
        });
    
      }
    }
  }

  getImageCount(): number {
  
    var count = 0;

    this.imgs.forEach((element) => {
      if( element.hasImg )
        count++;
    });

    return count;
  }
















  // 지도를 보여주는 함수
  showMap() {

    // 지도가 로드된 적이 있는지 확인 후...지도 로드
    if( !this.flag_mi )
      this.flag_mi = true;

    this.flag_sm = !this.flag_sm;
    this.flag_ap = false;

    if( this.getMarkerCount() > 0 )
      this.markerContent = "위치등록이 완료되었습니다.";
    else
      this.markerContent = "장소에 마커를 찍어주세요.";
  }

  // 지도에 마커를 찍을 수 있게 마커 핀을 활성화하는 함수
  activePin() {
    this.flag_ap = !this.flag_ap;
  }

  // 지도에 마커를 추가하는 함수
  addMarker(event) {

    // 마커 핀이 활성화 되지 않았을 경우
    if( !this.flag_ap )
      return;

    // 마커가 최대 개수만큼 찍혀있을 경우
    if( this.getMarkerCount() >= this.maxMarkerCount )
      return;

    // 클릭한 곳의 좌표
    var coords = event.coords;

    // 일반 MouseEvent 방지
    if( coords == null )
      return;

    console.log('lat', coords.lat);
    console.log('lng', coords.lng);

    // 현재 보이지 않는 마커 하나를 가져옴
    var marker = this.getEmptyMarker();

    marker.setVisibility(true);
    marker.setLat(coords.lat);
    marker.setLng(coords.lng);

    /*  마커 동적 생성 시도 부분(일단 실패)

    // this.markers.push({
    //   position: {lat: coords.lat, lng: coords.lng},
    //   image: {
    //     src: "assets/btn_icon/icon_marker.png",
    //     size: {width: 30, height: 30}
    //   },
    //   clickable: true,
    //   title: this.markerCount,
    //   label: this.markerCount
    // });

    // 해당 지점에 마커 추가
    // this.map._mapsWrapper.createMarker(this.markers[this.markers.length - 1]);

    // this.markerCount++;
    // nativeElement.insertAdjacentHTML('beforeend', '<tag></tag>');

    */
  }

  // 현재 지도에 보이는 마커의 수를 반환하는 메소드
  getMarkerCount(): number {

    var count = 0;

    this.markers.forEach((element: Marker) => {
      if( element.getVisibility() )
        count++;
    });

    return count;
  }

  // 현재 사용되지 않고 있는 마커를 반환하는 메소드
  getEmptyMarker(): Marker {

    var marker: Marker = null;

    this.markers.some((element: Marker) => {
      if( !element.getVisibility() ) {
        marker = element;
        return true;
      }
    });

    return marker;
  }

  // 카테고리를 선택/해제하는 메소드
  categorySelect(type: string) {

    this.categoryBtns.forEach((element) => {
      if( element.name == type ) {
        element.selected = !element.selected;        
        this.category = element.name;
      }
      else
        element.selected = false;
    })

  }

  // 만료일을 변경했을 경우
  dateChange() {

    // console.log(Date.now());
    console.log(this.expireDate);
    console.log(Date.parse(this.expireDate));

    // if( Date.parse(this.expireDate) <= Date.now() ) {
    //   console.log('fail');
    //   // event.preventDefault();
    //   // // this.expireDate = "";
    // }

  }


  // 추가 기능을 선택하는 메소드
  // chooseSubFunctionPrompt() {
  //   // chooseAlert 관련된 css는 ../app.scss 파일 참조
  //   let chooseAlert = this.alertCtrl.create({
  //     title: '추가 기능',
  //     message: '투표나 설문 조사 등의 기능을 게시글에 추가해보세요.',
  //     cssClass: 'custom_alert',
  //     inputs: [
  //       {
  //         label: '투표',
  //         type: 'radio',
  //         value: 'vote',
  //         checked: true,
  //       },
  //       {
  //         label: '설문 조사',
  //         type: 'radio',
  //         value: 'survey'
  //       }
  //     ],
  //     buttons: [
  //       {
  //         text: '취소',
  //         role: 'cancel',
  //         cssClass: 'custom_alert_btn',
  //         handler: data => {
  //           console.log('Cancel clicked');
  //         }
  //       },
  //       {
  //         text: '확인',
  //         cssClass: 'custom_alert_btn',
  //         handler: data => {  
  //           console.log(data);

  //           let subModal = this.modalCtrl.create(ContentWriteSub, {type: data});
  //           subModal.onDidDismiss(data => {

  //             if( data != null ) {
  //               console.log('success', data);
  //               console.log(data);
  //               this.subContent = JSON.parse(data);

  //             }
  //             else {
  //               console.log('cancel')
  //             }
  //           });
  //           subModal.present();
  //         }
  //       }
  //     ]
  //   });
  //   chooseAlert.present();
  // }

  addSubFunction(type) {
    let subModal = this.modalCtrl.create(ContentWriteSub, {type: type});
    subModal.onDidDismiss(data => {

      if( data != null ) {
        console.log('success', data);
        console.log(data);
        this.subContent = JSON.parse(data);

        if( this.mode == 'update' ) {
          this.subContentChanged = true;
        }
      }
      else {
        console.log('cancel')
      }
    });
    subModal.present();
  }

  // 추가 기능으로 생성된 내용 수정
  updateSub() {

    let subModal = this.modalCtrl.create(ContentWriteSub, {subContent: JSON.stringify(this.subContent)});

    subModal.onDidDismiss(data => {

      if( data != null ) {
        console.log('success', data);
        console.log(data);
        this.subContent = JSON.parse(data);

      }
      else {
        console.log('cancel')
      }
    });
    subModal.present();

    // slidingItem.close(); // 매개변수로 받아야함
  }

  // 추가 기능으로 생성된 내용 삭제
  removeSub() {
    this.subContent = null;

    if( this.mode == 'update' && !this.hasSubContent ) {
      this.subContentChanged = false;
    }
    else if(this.mode == 'update' && this.hasSubContent) {
      this.subContentChanged = true;
    }
  }

  cancel() {
    console.log("Cancel!!");

    this.navCtrl.pop();
    // this.navCtrl.pop('success');
  }

  post() {
    console.log("Post!!");

    if( this.getMarkerCount() == 0 ) {
      console.log("[필수] 마커 입력");
      return;
    }

    if( this.title == null || this.title.trim().length == 0 ) {
      console.log("[필수] 제목 입력");
      return;
    }

    if( this.category == null || this.category.trim().length == 0 ) {
      console.log("[필수] 분류 입력");
      return;
    }

    if( this.category == "이벤트" && this.expireDate == null ) {
      console.log("[필수] 만료일 입력");
      return;
    }

    if( this.content == null || this.content.trim().length == 0 ) {
      console.log("[필수] 내용 입력");
      return;
    }

    var tempMarker: any[] = [];
    this.markers.forEach((element) => {
      if( element.getVisibility() ) {
        tempMarker.push({
          "lat": element.getLat(),
          "lng": element.getLng()
        });
      }
    });

    var tempExpireDate = (this.expireDate == null)? 0: Date.parse(this.expireDate) + new Date().getTimezoneOffset() * 60000;
    var tempTagArray = this.tagContent.split("#");
    var tempTagContent = "";
    var tagCount = 0;

    if( tempTagArray.length > 1 ) {
      tempTagArray.some((tag) => {
        if( tempTagArray.indexOf(tag) > 0 && tag.trim() != "" ) {
          tempTagContent += "#" + tag;
          tagCount++;
        }

        if( tagCount > 2 ) {
          return true;
        }
      });
    }

    // 현재 로그인된 user_no를 가져온 후 서버로 값 전송
    this.localStorage.getData("user_no").then(value => {

      let body = {
        type: 'write',
        user_no: value,
        coords: tempMarker,
        title: this.title,
        category: this.category,
        expireDate: tempExpireDate,
        tag: tempTagContent,
        content: this.content,
        subContent: this.subContent,
        subContentChanged: this.subContentChanged,
        id: this.mode == 'update'? this.postId: null,
        res_type: 'image',
        res_kind: 'ub'
      }

      if( this.mode == 'update' ) {
        body.type = 'update';

        // 기존에 있던 sub_content를 삭제할 경우
        // if( this.navParams.get('item').sub_content != null && body.subContent == null ) {
        //   body.subContentChanged = true;
        // }
      }

      // subContent의 method가 time일 경우 startDate와 endDate를 millisecond로 변경
      if( body.subContent != null ) {
        body.subContent.startDate = (body.subContent.startDate == null)? 0: Date.parse(body.subContent.startDate) + new Date().getTimezoneOffset() * 60000;
        body.subContent.endDate = (body.subContent.endDate == null)? 0: Date.parse(body.subContent.endDate) + new Date().getTimezoneOffset() * 60000;    
      } 

      console.log("body: ", body);
      
      // 서버로 전송
      this.sevReq.getResult("write", body, this);
    }).catch((error) => {
      console.log(error);
    });
  }

  callback(domainURL: string, link: string, data: any) {

    
    

    if( link == "write" ) {

      this.postId = (this.mode == null)? data.id: this.postId;
      console.log("tempId", this.postId);

      // 이미지가 존재할 경우
      if( this.getImageCount() > 0 ) {

        let postImg: any = [];

        this.imgs.forEach((img) => {
          if( img.hasImg ) {
            postImg.push(img);
            this.changedImageCount++;
          }
        });

        console.log("image upload");

        this.ulh.uploadPhoto(postImg, "ub", this.mode, this.postId, this);
      
        

        // // 원래 이미지의 수보다 바뀐 이미지의 수가 더 적으면 서버에서 원래 이미지 중 일부를 지움
        // if( this.mode == null || (this.mode == 'update' && this.imgChanged) ) {
        //   console.log("image upload");
        //   this.ulh.uploadPhoto(postImg, "ub", tempId, this);
        // }
        // else {
        //   alert("성공적으로 글쓰기를 완료했습니다.");
        
        //   var currentPageNum = this.navCtrl.indexOf(this.navCtrl.last());
        //   this.navCtrl.push(ContentDetail, {id: tempId});
        //   this.navCtrl.remove(currentPageNum, 1);
        // }
      }
      else {
        console.log("No Have Image!!");
        console.log("id: ", this.postId);

        if( this.imgChanged ) {
          let body = {
            res_type: 'image',
            res_kind: 'ub',
            res_key: this.postId,
            originalImageCount: this.originalImageCount
          }

          this.sevReq.getResult('removeSrc', body, this);
        }
        else {
          alert("성공적으로 글쓰기를 완료했습니다.");

          if( this.mode == 'update' ) {
            var currentPageNum = this.navCtrl.indexOf(this.navCtrl.last()) - 1;
            this.navCtrl.push(ContentDetail, {id: this.postId});
            this.navCtrl.remove(currentPageNum, 2);
          }
          else {
            var currentPageNum = this.navCtrl.indexOf(this.navCtrl.last()) - 1;
            this.navCtrl.push(ContentDetail, {id: this.postId});
            // this.navCtrl.remove(currentPageNum, 1);
            this.navCtrl.remove(currentPageNum + 1, 1);
          }
        
          
        }

        // // 원래 이미지의 수보다 바뀐 이미지의 수가 더 적으면 서버에서 원래 이미지 중 일부를 지움
        // if( this.changedImageCount < this.originalImageCount ) {

        //   let body = {
        //     res_type: 'image',
        //     res_kind: 'ub',
        //     res_key: this.navParams.get('item').id,
        //     originalImageCount: this.originalImageCount,
        //     changedImageCount: this.changedImageCount
        //   };

        //   this.sevReq.getResult('removeSrc', body, this);
        // }
        // else {
          // alert("성공적으로 글쓰기를 완료했습니다.");
        
          // var currentPageNum = this.navCtrl.indexOf(this.navCtrl.last());
          // this.navCtrl.push(ContentDetail, {id: tempId});
          // this.navCtrl.remove(currentPageNum, 1);
        // }
      }
    }
    else if( link == "upload" ) {

      if( data == "fail" ) {
        console.log("upload fail!!");
        alert("업로드에 실패했습니다.");
        return;
      }

      if( this.mode == 'update' ) {
        console.log('originalImageCount', this.originalImageCount);
        console.log('changedImageCount', this.changedImageCount);

        let body = {
          res_type: 'image',
          res_kind: 'ub',
          res_key: this.postId,
          originalImageCount: this.originalImageCount,
          changedImageCount: this.changedImageCount
        }

        this.sevReq.getResult('removeSrc', body, this);
      }
      else {
        console.log("id: ", data);
        alert("성공적으로 글쓰기를 완료했습니다.(이미지 포함)");

        var currentPageNum = this.navCtrl.indexOf(this.navCtrl.last()) - 1;
        this.navCtrl.push(ContentDetail, {id: this.postId});
        // this.navCtrl.remove(currentPageNum);
        this.navCtrl.remove(currentPageNum + 1, 1);
      }

      

      // // 원래 이미지의 수보다 바뀐 이미지의 수가 더 적으면 서버에서 원래 이미지 중 일부를 지움
      // if( this.changedImageCount < this.originalImageCount ) {

      //   let body = {
      //     res_type: 'image',
      //     res_kind: 'ub',
      //     res_key: this.navParams.get('item').id,
      //     originalImageCount: this.originalImageCount,
      //     changedImageCount: this.changedImageCount
      //   };

      //   this.sevReq.getResult('removeSrc', body, this);
      // }
      // else {
      //   console.log("id: ", data);
      //   alert("성공적으로 글쓰기를 완료했습니다.(이미지 포함)");

      //   var currentPageNum = this.navCtrl.indexOf(this.navCtrl.last());
      //   this.navCtrl.push(ContentDetail, {id: tempId});
      //   this.navCtrl.remove(currentPageNum, 1);
      // }
    }
    else if( link == "subcontenttitle" ) {
      this.subContent = {
        type: data.type,
        title: data.title
      };
    }
    else if( link == "removeSrc" ) {
      console.log("id: ", data);
      alert("성공적으로 글쓰기를 완료했습니다.(이미지 삭제)");

      var currentPageNum = this.navCtrl.indexOf(this.navCtrl.last()) - 1;
      // console.log("currentPageNum", currentPageNum);
      this.navCtrl.push(ContentDetail, {id: this.postId});
      this.navCtrl.remove(currentPageNum, 2);
    }
  }
}


// 마커에 대한 Custom Class
class Marker {

  private lat: number = 0;
  private lng: number = 0;
  private visibility: boolean = false;
  private image: any = {src: "assets/btn_icon/icon_marker.png", 
                        size: {
                            width: 20, 
                            height: 20
                          }
                        };

  constructor() {
  }

  setLat(lat: number) {
    this.lat = lat;
  }

  setLng(lng: number) {
    this.lng = lng;
  }

  getLat(): number {
    return this.lat;
  }

  getLng(): number {
    return this.lng;
  }

  setVisibility(visibility: boolean) {
    this.visibility = visibility;
  }

  getVisibility(): boolean {
    return this.visibility;
  }

}

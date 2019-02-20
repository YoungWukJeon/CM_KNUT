import { Injectable } from '@angular/core';
import { File } from '@ionic-native/file';
import { Transfer } from '@ionic-native/transfer';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';

// provider
import { ServerRequester } from '../providers/server-requester';

/*
  Generated class for the UploadHandler provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/

/*
2017.06.05 made by Youngwuk Jeon

  <Update Log>
  
*/

@Injectable()
export class UploadHandler {

  current: number;
  total: number;
  // progress: number;

  private imgs: any[] = [];
  private res_kind: string = null;
  private key: number = null;
  private cla: any = null;
  private uploadType: string = null;

  constructor(private file: File, private transfer: Transfer, private http: Http, private sevReq: ServerRequester) {
    console.log('Hello UploadHandler Provider');
  }

  uploadPhoto(imgs: any[], res_kind, uploadType: string = null, key, cla: any) {

    this.imgs = imgs;
    this.res_kind = res_kind;
    this.uploadType = uploadType;
    this.key = key;
    this.cla = cla;

    // if(!this.imgs || this.imgs.length == 0) {
    //     // let alert = Alert.create({
    //     //     title: "Error",
    //     //     subTitle: "No images found to upload",
    //     //     buttons: ['Ok']
    //     // });
    //     // nav.present(alert);
    //     // alert("No images found to upload");
    //     console.log("No image found to upload");
    //     return;
    // }

    this.sevReq.createLoading(10000, 'uploading...');

    this.current = 1;
    this.total = this.imgs.length;   
    this.upload(this.imgs[0]);
    
    // let bigMapModal = this.modalCtrl.create(HomeNavi, {img1: this.imgs[0], img2: this.imgs[1]});
    // bigMapModal.present();      
  }

  upload = (img: any): void => {

    console.log("KEY:", this.key);
    // alert(img.src);
    // alert(img.src + ",,,,,,,,,,," + img.original_path);

    // 기존의 서버에 존재하는 이미지일 경우
    if( img.src.includes(this.sevReq.getDomainURL()) || img.src == img.original_path ) {
      // alert(img.src);

      let body = {
        res_type: img.res_type,
        res_kind: (this.res_kind == 'multi')? img.res_kind: this.res_kind,
        key: this.key,
        filePath: img.src.includes(this.sevReq.getDomainURL())? img.src.split(this.sevReq.getDomainURL())[1].split('?')[0]: img.src.split('?')[0],
        fileIndex: this.current
      }

      this.http.post(this.sevReq.getDomainURL() + "duplicatedfileprocess", JSON.stringify(body), {headers: this.sevReq.setHeader()}).map(res => res.json()).subscribe(data => {
        console.log('image change Succeed');
        this.success('success');
      });
    }
    else {
      // alert("upload!!!" + img.src);

      let ft = this.transfer.create();
      let filename = img.src.split('/').pop();
      let options = {
        fileKey: "file",
        filename: filename,
        chunkedMode: false,
        // mimeType: "multipart/form-data",
        mimeType: "image/jpeg",
        params: {
          filename: filename,
          index: this.current, 
          res_type : img.res_type, 
          res_kind: (this.res_kind == 'multi')? img.res_kind: this.res_kind,
          uploadType: this.uploadType,
          key: this.key
        }
      };

      // ft.onProgress(this.onProgress);
      ft.upload(img.imgNewPath, encodeURI(this.sevReq.getDomainURL() + "upload"), options, false)
      .then((result: any) => {
        this.success(result);
      }).catch((error: any) => {
        this.failed(error);
      });
    }

    
  }

  success = (result: any): void => { 

    console.log("result: ", result);

        if(this.current < this.total) {             
            this.current++;
            // this.progress = 0;                    
            this.upload(this.imgs[this.current - 1]);
        } else {   

          setTimeout(() => {
            this.sevReq.closeLoading();
            this.cla.callback(this.sevReq.getDomainURL(), "upload", this.key);
          }, 1000);
        }
    }
            
    failed = (err: any): void => {
        let code = err.code;
        alert("Failed to upload image. Code: " + code);
        this.sevReq.closeLoading();
        this.cla.callback(this.sevReq.getDomainURL(), "upload", "fail");
    }

  // onProgress =  (progressEvent: ProgressEvent) : void => {
  //       this.ngZone.run(() => {
  //           if (progressEvent.lengthComputable) {
  //               let progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
  //               console.log(progress);
  //               this.progress = progress
  //           }
  //       });
  //   }

  

}

import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http'; // [2017.05.20] http Module add
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { InAppBrowser } from '@ionic-native/in-app-browser';  // [2017.05.23] inAppModule add
import { IonicStorageModule } from '@ionic/storage';  // [2017.05.30] storageModule add
import { File } from '@ionic-native/file';  // [2017.06.05] file add
import { Transfer } from '@ionic-native/transfer';  // [2017.06.05] transfer add
import { Camera } from '@ionic-native/camera';  // [2017.06.05] camera add
import { Diagnostic } from '@ionic-native/diagnostic';  // [2017.06.05] diagnostic add
import { PhotoViewer } from '@ionic-native/photo-viewer'; // [2017.06.07] photo-viewer add
// import { GooglePlus } from '@ionic-native/google-plus'; // [2017.06.29] google-plus add



// pages
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { HomeContent } from '../pages/home-content/home-content';
import { HomeMap } from '../pages/home-map/home-map';
import { ContentSearch } from '../pages/content-search/content-search';
import { ContentDetail } from '../pages/content-detail/content-detail';
import { ContentDetailSubContent } from '../pages/content-detail-sub-content/content-detail-sub-content';
import { ContentDetailSubContentResult } from '../pages/content-detail-sub-content-result/content-detail-sub-content-result';
import { ContentDetailFacility } from '../pages/content-detail-facility/content-detail-facility';
import { ContentReply } from '../pages/content-reply/content-reply';
import { ContentReplyReply } from '../pages/content-reply-reply/content-reply-reply';
import { ContentReplyUpdate } from '../pages/content-reply-update/content-reply-update';
import { ContentLike } from '../pages/content-like/content-like';
import { ContentWrite } from '../pages/content-write/content-write';
import { ContentWriteSub } from '../pages/content-write-sub/content-write-sub';
import { UserInfo } from '../pages/user-info/user-info';
import { UserInfoUpdate } from '../pages/user-info-update/user-info-update';
import { Login } from '../pages/login/login';
import { BigMap } from '../pages/big-map/big-map';
import { UserAgree } from '../pages/user-agree/user-agree';
import { UserEmail } from '../pages/user-email/user-email';
import { UserForm } from '../pages/user-form/user-form';
import { UserPwSearch } from '../pages/user-pw-search/user-pw-search';
import { Busboard } from '../pages/busboard/busboard';

// modules
import { AdmCoreModule } from 'ngx-daum-map';

// providers
import { ServerRequester } from '../providers/server-requester';
import { LocalStorage } from '../providers/local-storage';
import { MenuContent } from '../providers/menu-content';
import { InAppBrowserHandler } from '../providers/in-app-browser-handler';
import { UploadHandler } from '../providers/upload-handler';
import { PermissionsService } from '../providers/permissions-service';



@NgModule({
  declarations: [
    MyApp,
    HomePage,
    HomeContent,
    HomeMap,
    ContentSearch,
    ContentDetail,
    ContentDetailSubContent,
    ContentDetailSubContentResult,
    ContentDetailFacility,
    ContentReply,
    ContentReplyReply,
    ContentReplyUpdate,
    ContentLike,
    ContentWrite,
    ContentWriteSub,
    UserInfo,
    UserInfoUpdate,
    Login,
    BigMap,
    UserAgree,
    UserEmail,
    UserForm,
    UserPwSearch,
    Busboard
  ],
  imports: [
    BrowserModule,
    HttpModule,
    AdmCoreModule.forRoot({
      apiKey: 'YourModuleKey'  // 재호형 키
    }),
    IonicModule.forRoot(MyApp, {
      backButtonText: '',
      iconMode: 'ios',
      modalEnter: 'modal-slide-in',
      modalLeave: 'modal-slide-out',
      tabsPlacement: 'bottom',
      pageTransition: 'ios-transition'
    }),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    HomeContent,
    HomeMap,
    ContentSearch,
    ContentDetail,
    ContentDetailSubContent,
    ContentDetailSubContentResult,
    ContentDetailFacility,
    ContentReply,
    ContentReplyReply,
    ContentReplyUpdate,
    ContentLike,
    ContentWrite,
    ContentWriteSub,
    UserInfo,
    UserInfoUpdate,
    Login,
    BigMap,
    UserAgree,
    UserEmail,
    UserForm,
    UserPwSearch,
    Busboard
  ],
  providers: [
    StatusBar,
    SplashScreen,
    InAppBrowser,
    File,
    Transfer,
    Camera,
    Diagnostic,
    PhotoViewer,
    // GooglePlus,
    PermissionsService,
    ServerRequester,
    LocalStorage,
    MenuContent,
    InAppBrowserHandler,
    UploadHandler,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})

export class AppModule {}

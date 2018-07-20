import { Component, ViewChild, NgZone } from '@angular/core';
import { Platform, Nav, Events, MenuController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';

import { Push, PushObject } from '@ionic-native/push';

import { LoginPage } from '../pages/login/login';
import { AuthServiceProvider } from '../providers/auth-service/auth-service';
import { EventsSchedulePage } from '../pages/events-schedule/events-schedule';
import { RosterPage } from '../pages/roster/roster';
import { HttpClient } from '@angular/common/http';
import { BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationResponse } from '@ionic-native/background-geolocation';


import { interceptor } from '../providers/auth-service/interceptor';
import { MyTaskPage } from '../pages/my-task/my-task';
import { ListChatsPage } from '../pages/list-chats/list-chats';
import { ViewProfilePage } from '../pages/view-profile/view-profile';

import { TranslateService } from '@ngx-translate/core';
import { HelpersProvider } from '../providers/helpers/helpers';
import { AddTeamPage } from '../pages/add-team/add-team';
import { WebIntent } from '@ionic-native/web-intent';
import { INotificationProvider } from '../providers/i-notification/i-notification';
import { ViewRequestsPage } from '../pages/view-requests/view-requests';


@Component({
  templateUrl: 'app.html'
})

export class MyApp {
  @ViewChild('mycontent') nav: Nav;

  public static me: MyApp;

  public notificationEnable: boolean = false;
  private permision: boolean = false;
  public static User: any;
  public pushObject: PushObject;
  public static newDatas: any = {};

  public nameReady = false;
  public teamName = "";

  public user: any = {
    username: ""
  };

  //public toas: Toast;
  public team: any = { request: [] }

  public username = "Senorcoders";
  public userimg = "./assets/imgs/user.jpg";
  public logo = "./assets/imgs/logo-login.png";
  public defaultImageUserUrl = "./assets/imgs/user-menu.png";
  public defaultImageUser = true;

  public pages: Array<Object> = [
    { title: "NAVMENU.EVENTS", component: EventsSchedulePage, icon: "basketball", role: "*", watch: "", newData: "" },
    { title: "NAVMENU.MYTASK", component: MyTaskPage, icon: "basketball", role: "*", watch: "", newData: "" },
    { title: "NAVMENU.ROSTER", component: RosterPage, icon: "baseball", role: "*", watch: "", newData: "" },
    { title: "NAVMENU.MESSAGES", component: ListChatsPage, icon: "baseball", role: "*", watch: "chat", newData: "" },
    { title: "REQUESTS", component: ViewRequestsPage, icon: "baseball", role: "Manager", watch: "request", newData: "request" },
    { title: "NEWTEAM.ADD", component: AddTeamPage, icon: "baseball", role: "*", watch: "", newData: "" }
  ];
  public newDataSchema = [{ id: 'request', role: 'Manager' }, { id: 'chat', role: '*' }];

  constructor(public platform: Platform, public statusBar: StatusBar,
    public auth: AuthServiceProvider, public menuCtrl: MenuController,
    public pusherNotification: Push, private http: HttpClient,
    public event: Events, public zone: NgZone,
    public translate: TranslateService, private helper: HelpersProvider,
    public webIntent: WebIntent, public iNotification: INotificationProvider,
    public backgroundGeolocation: BackgroundGeolocation
  ) {
    platform.ready().then(this.initPlatform.bind(this));
  }

  private initPlatform() {

    this.translate.setDefaultLang('en');

    // the lang to use, if the lang isn't available, it will use the current loader to get them
    this.translate.use('en');

    // Okay, so the platform is ready and our plugins are available.
    // Here you can do any higher level native things you might need.
    this.statusBar.overlaysWebView(false);
    this.statusBar.backgroundColorByName("white");

    this.pusherNotification.hasPermission()
      .then((res: any) => {

        if (res.isEnabled) {
          console.log('We have permission to send push notifications');
          MyApp.me.permision = true;
        } else {
          console.log('We do not have permission to send push notifications');
        }

      });

    //para geofences en android usando el plugin background geolocation
    const config: BackgroundGeolocationConfig = {
      desiredAccuracy: 10,
      stationaryRadius: 20,
      distanceFilter: 30,
      debug: true, //  enable this hear sounds for background-geolocation life-cycle.
      stopOnTerminate: false, // enable this to clear background location settings when the app terminates
    };

    this.backgroundGeolocation.configure(config)
      .subscribe(function(location: BackgroundGeolocationResponse) {

        console.log("location background", location);

        let myPosition = {lat: location.latitude, lng: location.longitude};
        this.helper.executeGeofencesIOS(myPosition);
        
        // IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
        // and the background-task may be completed.  You must do this regardless if your HTTP request is successful or not.
        // IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
        this.backgroundGeolocation.finish(); // FOR IOS ONLY

      }.bind(this));

    // start recording location
    this.backgroundGeolocation.start();


    this.init();

  }

  public init() {
    MyApp.me = this;
    this.serviceNewDatas();
    setInterval(this.serviceNewDatas.bind(this), 6000);
    this.initAuth();
  }

  async initAuth() {

    var authenticated = await this.auth.checkUser();
    if (authenticated === true) {
      this.nav.root = EventsSchedulePage;
      this.user = this.auth.User();
      MyApp.User = this.auth.User();

      //Para actualizar el nombre del equipo en menu slide
      let team: any = await this.http.get("/teams/" + MyApp.User.team).toPromise();
      document.getElementById("nameTeam").innerHTML = team.name;

      //console.log(this.user);
      let ramdon = new Date().getTime();
      this.userimg = interceptor.transformUrl("/images/" + ramdon + "/users&thumbnail/" + this.user.id);
      document.getElementById("imageSlide").setAttribute("src", this.userimg);

      //ahora asignamos el lenaguaje si es que esta definido
      if (MyApp.User.hasOwnProperty('options') && MyApp.User.options.hasOwnProperty('language')) {
        await this.helper.setLanguage(MyApp.User.options.language);
      } else {
        this.helper.setLanguage('en')
      }

    } else {
      this.nav.root = LoginPage;
    }

    //se actualiza nombre y la imagen de usuario manualmente por ngZone ni dateRef funcionan
    this.auth.changeUser(function () {

      this.defaultImageUser = true;
      this.user = this.auth.User();

      console.log("cambiooo", this.user);
      let ramdon = new Date().getTime();
      this.userimg = interceptor.transformUrl("/images/" + ramdon + "/users&thumbnail/" + this.user.id);
      document.getElementById("imageSlide").setAttribute("src", this.userimg);
      //document.getElementById("nameSlide").innerText = t.user.username;
      this.user = MyApp.User;
    }.bind(this));

    this.serviceNewDatas();
  }

  //#region Para maneja los puntos de notifications en el app, puntos rojos cuando hay algo nuevo
  private async serviceNewDatas() {
    //get new requests
    if (MyApp.User === null || MyApp.User === undefined)
      return;

    this.team = await this.http.get("/team/profile/" + MyApp.User.team).toPromise();
    //console.log(this.team);
    if (!this.team.hasOwnProperty("request")) {
      this.team.request = [];
    }

    if (this.team.request.length !== 0) {
      MyApp.newDatas["request"] = true;
    } else {
      MyApp.newDatas["request"] = false;
    }

    this.checkNewDatas();
    this.zone.run(() => { MyApp.newDatas = MyApp.newDatas; });
  }

  private checkNewDatas() {
    //console.log(MyApp.newDatas);
    if (this.newData(this.newDataSchema) === false) {
      this.insertPointNewMenuToggle();
    } else {
      this.deletePointNewMenuToggle();
    }
  }

  private insertPointNewMenuToggle() {
    if (document.querySelector("div.point-new-menu-toggle") !== null) return;

    let div = document.createElement("div");
    div.setAttribute("class", "point-new-menu-toggle");
    document.querySelector("button[menutoggle]").appendChild(div);
  }

  private deletePointNewMenuToggle() {
    if (document.querySelector("div.point-new-menu-toggle") === null) return;
    document.querySelector("button[menutoggle]").removeChild(document.querySelector("div.point-new-menu-toggle"));
  }

  public newData(id): boolean {
    if (MyApp.User === null || MyApp.User === undefined) return true;

    if (Object.prototype.toString.call(id) === '[object Array]') {

      let valid = false;
      for (let i of id) {
        if (MyApp.newDatas.hasOwnProperty(i.id)) {
          if (MyApp.newDatas[i.id] === true && (i.role === MyApp.User.role.name || i.role === '*')) {
            valid = true;
          }
        }
      }
      return !valid;
    }

    if (MyApp.newDatas.hasOwnProperty(id))
      return !MyApp.newDatas[id];

    return !false;
  }
  //#endregion

  public loadImageMenu() {
    this.defaultImageUser = false;
  }

  public async logout() {
    var response = await this.auth.logout();
    if (response === true) {
      this.nav.root = LoginPage;
    }
    this.menuCtrl.close();
  }

  public async goToPage(page) {
    await this.nav.setRoot(page);
    this.checkNewDatas();
    this.menuCtrl.close();
  }

  public async goProfile() {
    await this.nav.setRoot(ViewProfilePage);
    this.checkNewDatas();
    this.menuCtrl.close();
  }

  public validRolePage(page, newDatas) {

    //Para verificar si nesesita de newData, para mostrarse
    newDatas = newDatas || 'not';
    if (newDatas !== 'not') {
      if (this.newData(newDatas) === true) {
        return false;
      }
    }

    if (page.role === "*") return true;

    let valid = MyApp.User === undefined || MyApp.User === null;

    if (valid === true) {
      return true;
    }
    //console.log(MyApp.User.role.name, page.role);
    return MyApp.User.role.name === page.role;
  }

  public static async initNotifcations() {

    if (MyApp.me.notificationEnable === true && MyApp.me.permision === false) {
      return;
    }

    MyApp.notifcations(MyApp.User.team);

  }


  //#region for push notifications configuration
  public static async notifcations(team) {

    // Return a list of currently configured channels
    //MyApp.pusherNotification.listChannels().then((channels) => console.log('List of channels', channels))

    // to initialize push notifications

    //console.log(team);
    const options: any = {
      android: {
        senderID: "318853826702",
        topics: [team],
        sound: true,
        vibrate: true,
        soundname: "default"/*,
        forceShow: true*/
      },
      ios: {
        alert: 'true',
        badge: true,
        sound: 'true',
        soundname: "default"
      },
      windows: {},
      browser: {
        pushServiceURL: 'https://serviciosrivenses.firebaseio.com'
      }
    };

    try {

      //#region for notification in team
      MyApp.me.pushObject = MyApp.me.pusherNotification.init(options);

      MyApp.me.pushObject.on('notification').subscribe(async function (notification: any) {

        let verb = notification.additionalData.verb, is = notification.additionalData.is;

        console.log(notification.additionalData.dataStringify);

        if (Object.prototype.toString.call(notification.additionalData.dataStringify) == "[object String]") {
          notification.additionalData.dataStringify = JSON.parse(notification.additionalData.dataStringify);
        }

        console.log(notification.additionalData.dataStringify);


        MyApp.me.event.publish(is + ":" + verb, notification.additionalData.dataStringify, Date.now());

        INotificationProvider.me.processNotificationForeGround(is, verb, notification);
        /*let intents = { extras: { is: is, dataStringify: notification.additionalData.dataStringify } };
        MyApp.me.processNotification(intents);*/

      });

      MyApp.me.pushObject.on('registration').subscribe((registration: any) => {

        if (MyApp.User.tokenReady === true) {
          MyApp.me.notificationEnable = true;
          return;
        }
        MyApp.me.notificationEnable = true;
        MyApp.me.auth.updateTokenReg(registration.registrationId);
        console.log('Device registered', registration);
      });

      MyApp.me.pushObject.on('error').subscribe(error => console.error('Error with Push plugin', error));
      //#endregion

    }
    catch (e) {
      console.error(e);
    }

    //#endregion

    //#region para cuando se toca una notification y el app esta cerrada y entra
    try {
      let intents = await MyApp.me.webIntent.getIntent();
      INotificationProvider.me.processNotificacionBackground(intents);
    }
    catch (e) {
      console.error(e);
    }
    //#endregion

    //#region cuando se toca una notification y el app esta en background
    MyApp.me.webIntent.onIntent().subscribe(function (intent) {
      INotificationProvider.me.processNotificacionBackground(intent);
    }, console.error);
    //#endregion

  }


}



import { Component, ViewChild, NgZone } from '@angular/core';
import { Platform, Nav, Events, MenuController } from 'ionic-angular';

import { Push, PushObject } from '@ionic-native/push';

import { LoginPage } from '../pages/login/login';
import { AuthServiceProvider } from '../providers/auth-service/auth-service';
import { EventsSchedulePage } from '../pages/events-schedule/events-schedule';
import { RosterPage } from '../pages/roster/roster';
import { HttpClient } from '@angular/common/http';
import { SplashScreen } from '@ionic-native/splash-screen';

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
import { AgentFreePage } from '../pages/agent-free/agent-free';
import { PlacesPlayerFreePage } from '../pages/places-player-free/places-player-free';
import { RequestsPlayerPage } from '../pages/requests-player/requests-player';
import { CreateLeaguePage } from '../pages/create-league/create-league';
import { TeamsLeaguePage } from '../pages/teams-league/teams-league';
import { SettingPage } from '../pages/setting/setting';
import { RequestsLeaguePage } from '../pages/requests-league/requests-league';
import { StatusBar } from '@ionic-native/status-bar';
import { PhotosPage } from '../pages/photos/photos';


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
  public static counts: any = {};

  public nameReady = false;
  public rolIdentity = "";
  public identity = "";

  public user: any = {
    username: ""
  };

  //public toas: Toast;
  public team: any = { request: [] }

  public username = "Senorcoders";
  public userimg = "./assets/imgs/user.jpg";
  public defaultImageUser = true;

  public pages: Array<Object> = [
    { title: "NAVMENU.EVENTS", component: EventsSchedulePage, icon: "events.png", role: { not: "FreeAgent", yes: "*" }, watch: "", newData: "" },
    { title: "NAVMENU.ROSTER", component: RosterPage, icon: "roster.png", role: { not: "FreeAgent|OwnerLeague", yes: "*" }, watch: "", newData: "" },
    { title: "PHOTOS.TITLE", component: PhotosPage, icon: "photos.png", role: { not: "FreeAgent|OwnerLeague", yes: "*" }, watch: "", newData: "" },
    { title: "NAVMENU.MESSAGES", component: ListChatsPage, icon: "chat.png", role: { not: "FreeAgent|OwnerLeague", yes: "*" }, watch: "chat", newData: "" },
    { title: "NAVMENU.MYTASK", component: MyTaskPage, icon: "tasks.png", role: { not: "FreeAgent|OwnerLeague", yes: "*" }, watch: "", newData: "" },
    { title: "LEAGUE.TEAMS.TITLE", component: TeamsLeaguePage, icon: "add-team.png", role: "OwnerLeague", watch: "", newData: "" },
    { title: "REQUESTS", component: ViewRequestsPage, icon: "baseball", role: { not: "FreeAgent|OwnerLeague", yes: "Manager" }, watch: "request", newData: "request" },
    { title: "REQUESTSTEAM", component: RequestsPlayerPage, icon: "baseball", role: "*", watch: "requestPlayer", newData: "requestPlayer" },
    { title: "REQUESTLEAGUE.NAME", component: RequestsLeaguePage, icon: "baseball", role: "Manager", watch: "requestLeague", newData: "requestLeague" },
    { title: "AGENTFREE.TITLE", component: AgentFreePage, icon: "baseball", role: "FreeAgent", watch: "", newData: "" },
    { title: "PLACES.TITLE", component: PlacesPlayerFreePage, icon: "baseball", role: "FreeAgent", watch: "", newData: "" },
  ];
  public newDataSchema = [{ id: 'request', role: 'Manager' }, { id: 'chat', role: '*' }];

  constructor(public platform: Platform, public auth: AuthServiceProvider,
    public menuCtrl: MenuController, public pusherNotification: Push,
    private http: HttpClient, public event: Events,
    public zone: NgZone, public translate: TranslateService,
    private helper: HelpersProvider, public webIntent: WebIntent,
    private INoti: INotificationProvider, public splash: SplashScreen,
    private statusBar: StatusBar
  ) {
    platform.ready().then(this.initPlatform.bind(this));
  }

  private initPlatform() {
    this.translate.setDefaultLang('en');

    // the lang to use, if the lang isn't available, it will use the current loader to get them
    this.translate.use('en');

    this.pusherNotification.hasPermission()
      .then((res: any) => {

        if (res.isEnabled) {
          console.log('We have permission to send push notifications');
          MyApp.me.permision = true;
        } else {
          console.log('We do not have permission to send push notifications');
        }

      });


    this.init();

  }

  public async init() {
    try {
      MyApp.me = this;
      this.serviceNewDatas();
      setInterval(this.serviceNewDatas.bind(this), 6000);
      await this.initAuth();
    }
    catch (e) {
      console.error(e);
    }
    this.splash.hide();
  }

  async initAuth() {

    var authenticated = await this.auth.checkUser();
    if (authenticated === true) {

      this.statusBar.overlaysWebView(false);

      this.user = this.auth.User();
      MyApp.User = this.auth.User();

      console.log("User", this.user);

      //Si es un agente libre
      if(MyApp.User.role.name === 'OwnerLeague'){
        this.statusBar.backgroundColorByHexString("#32a0fe");

      }else{
        this.statusBar.backgroundColorByHexString("#fe324d");
      }
     if (MyApp.User.role.name === "FreeAgent") {
        this.rolIdentity = "";
        this.identity = "";
        this.nav.root = AgentFreePage;
      } else {
        this.nav.root = EventsSchedulePage;
        if (MyApp.User.hasOwnProperty("team")) {

          //Para actualizar el nombre del equipo en menu slide
          let team: any = await this.http.get("/teams/" + MyApp.User.team).toPromise();
          this.rolIdentity = "TEAM";
          this.identity = team.name;
        }else{
          let league;
          if(Object.prototype.toString.call(MyApp.User.role.league) === "[object Object]"){
            league = MyApp.User.role.league;
          }else{
            league = await this.http.get("/leagues/"+ MyApp.User.role.league).toPromise() as any;
          } 
          this.rolIdentity = "LEAGUE.NAME";
          this.identity = league.name;
        }

      }

      //console.log(this.user);
      let ramdon = new Date().getTime();
      this.userimg = interceptor.transformUrl("/userprofile/images/"+ MyApp.User.id+ "/"+ MyApp.User.team);
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
    this.auth.changeUser(async function () {

      this.defaultImageUser = true;
      this.user = this.auth.User();

      console.log("cambiooo", this.user);
      let team = MyApp.User.team !== undefined && MyApp.User.team !== null ? MyApp.User.team : "undefined";
      this.userimg = interceptor.transformUrl("/userprofile/images/"+ MyApp.User.id+ "/"+ team);
      document.getElementById("imageSlide").setAttribute("src", this.userimg);

      this.user = MyApp.User;

      if (MyApp.User.hasOwnProperty("team")) {

        //Para actualizar el nombre del equipo en menu slide
        let team: any = await this.http.get("/teams/" + MyApp.User.team).toPromise();
        this.rolIdentity = "TEAM";
        this.identity = team.name;
      }else{
        let league;
        if(Object.prototype.toString.call(MyApp.User.role.league) === "[object Object]"){
          league = MyApp.User.role.league;
        }else{
          league = await this.http.get("/leagues/"+ MyApp.User.role.league).toPromise() as any;
        }
        this.rolIdentity = "LEAGUE.NAME";
        this.identity = league.name;
      }

    }.bind(this));

    this.serviceNewDatas();

  }

  //#region Para maneja los puntos de notifications en el app, puntos rojos cuando hay algo nuevo
  private async serviceNewDatas() {
    //get new requests for managers
    if (MyApp.User === null || MyApp.User === undefined)
      return;

    //Para comprobar si hay nuevos request
    //Para los players
    let requestsPlayer: any = await this.http.get("/playerfree/request/" + MyApp.User.id).toPromise();
    if (requestsPlayer.length > 0) {
      MyApp.newDatas["requestPlayer"] = true;
      MyApp.counts["requestPlayer"] = requestsPlayer.length;
    } else {
      MyApp.newDatas["requestPlayer"] = false;
      MyApp.counts["requestPlayer"] = 0;
    }
    this.checkNewDatas();
    this.zone.run(() => { MyApp.newDatas = MyApp.newDatas; });
    if (MyApp.User.role.name === "FreeAgent")
      return;

    //Para saber si hay request para league
    if (MyApp.User.role.name === "Manager") {

      let requestsLeague: any[] = await this.http.get(`/teamleague?where={"teamPre":"${MyApp.User.team}"}`).toPromise() as any;
      if (requestsLeague.length > 0) {
        MyApp.newDatas["requestLeague"] = true;
        MyApp.counts["requestLeague"] = requestsLeague.length;
      } else {
        MyApp.newDatas["requestLeague"] = false;
        MyApp.counts["requestLeague"] = 0;
      }
      this.checkNewDatas();
      this.zone.run(() => { MyApp.newDatas = MyApp.newDatas; });
    }

    //Para saber si hay nuevos request para unirse a equipos
    this.team = await this.http.get("/team/profile/" + MyApp.User.team).toPromise();
    //console.log(this.team);
    if (!this.team.hasOwnProperty("request")) {
      this.team.request = [];
    }

    if (this.team.request.length !== 0) {
      MyApp.newDatas["request"] = true;
      MyApp.counts["request"] = this.team.request.length;
    } else {
      MyApp.newDatas["request"] = false;
      MyApp.counts["request"] = 0;
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

  public getCounts(watch) {
    if (MyApp.counts.hasOwnProperty(watch)) {
      return MyApp.counts[watch];
    }

    return 0;
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

    if (Object.prototype.toString.call(page.role) === "[object String]")
      return MyApp.User.role.name === page.role;

    if (Object.prototype.toString.call(page.role) === "[object Object]") {

      //Para multitples roles en not
      if (page.role.not.includes("|")) {
        let validFast = true;
        let nots = page.role.not.split("|");
        for (let n of nots) {
          if (n === MyApp.User.role.name) {
            validFast = false;
          }
        }

        return validFast;
      }

      //Para multitples roles en yes
      if (page.role.yes.includes("|")) {
        let validFast = false;
        let yess = page.role.yes.split("|");
        for (let s of yess) {
          if (s === MyApp.User.role.name) {
            validFast = true;
          }
        }

        return validFast;
      }

      if (page.role.not === MyApp.User.role.name)
        return false;
      else if (page.role.yes === MyApp.User.role.name)
        return true;
      else if (page.role.yes === "*") {
        return true;
      }
    }
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



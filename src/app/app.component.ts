import { Component, ViewChild, NgZone, isDevMode } from '@angular/core';
import { Platform, Nav, Events, MenuController, ViewController } from 'ionic-angular';

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
import { WebIntent } from '@ionic-native/web-intent';
import { INotificationProvider } from '../providers/i-notification/i-notification';
import { ViewRequestsPage } from '../pages/view-requests/view-requests';
import { AgentFreePage } from '../pages/agent-free/agent-free';
import { PlacesPlayerFreePage } from '../pages/places-player-free/places-player-free';
import { RequestsPlayerPage } from '../pages/requests-player/requests-player';
import { TeamsLeaguePage } from '../pages/teams-league/teams-league';
import { RequestsLeaguePage } from '../pages/requests-league/requests-league';
import { StatusBar } from '@ionic-native/status-bar';
import { PhotosPage } from '../pages/photos/photos';

import * as moment from 'moment';
import { NotificationPage } from '../pages/notification/notification';
import { WebSocketsProvider } from '../providers/web-sockets/web-sockets';
import { AddFamilyPage } from '../pages/add-family/add-family';
import { TabsPage } from '../pages/tabs/tabs';

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
  public userimg = "";
  public fullName: any;

  public pages: Array<Object> = [
    { title: "NAVMENU.EVENTS", component: EventsSchedulePage, icon: "events.png", role: { not: "FreeAgent", yes: "*" }, watch: "", newData: "" },
    { title: "NAVMENU.ROSTER", component: RosterPage, icon: "roster.png", role: { not: "FreeAgent|OwnerLeague", yes: "*" }, watch: "", newData: "" },
    { title: "PHOTOS.TITLE", component: PhotosPage, icon: "photos.png", role: { not: "FreeAgent|OwnerLeague", yes: "*" }, watch: "", newData: "" },
    { title: "NAVMENU.MESSAGES", component: ListChatsPage, icon: "chat.png", role: { not: "FreeAgent|OwnerLeague", yes: "*" }, watch: "chat", newData: "" },
    // { title: "ADDFAMILY.TITLE", component: AddFamilyPage, icon: "people.png", role: { not: "FreeAgent|OwnerLeague", yes: "*" }, watch: "", newData: "" },
    { title: "NAVMENU.MYTASK", component: MyTaskPage, icon: "tasks.png", role: { not: "FreeAgent|OwnerLeague|Manager|Family", yes: "*" }, watch: "", newData: "" },
    { title: "LEAGUE.TEAMS.TITLE", component: TeamsLeaguePage, icon: "add-team.png", role: "OwnerLeague", watch: "", newData: "" },
    { title: "NOTIFCATION.TITLE", component: NotificationPage, icon: "request-icon.svg", role: { not: "FreeAgent|OwnerLeague", yes: "Manager" }, watch: "", newData: "" },
    { title: "REQUESTS", component: ViewRequestsPage, icon: "request-icon.svg", role: { not: "FreeAgent|OwnerLeague", yes: "Manager" }, watch: "request", newData: "request" },
    { title: "REQUESTSTEAM", component: RequestsPlayerPage, icon: "request-icon.svg", role: "*", watch: "requestPlayer", newData: "requestPlayer" },
    { title: "REQUESTLEAGUE.NAME", component: RequestsLeaguePage, icon: "request-icon.svg", role: "Manager", watch: "requestLeague", newData: "requestLeague" },
    { title: "AGENTFREE.TITLE", component: AgentFreePage, icon: "nearby-events-icon.svg", role: "FreeAgent", watch: "", newData: "" },
    { title: "PLACES.TITLE", component: PlacesPlayerFreePage, icon: "events-places.svg", role: "FreeAgent", watch: "", newData: "" },
  ];
  public newDataSchema = [
    { id: 'request', role: 'Manager' },
    { id: 'chat', role: '*' },
    { id: 'requestPlayer', role: 'FreeAgent' },
    { id: "requestLeague", role: "Manager" }
  ];

  constructor(public platform: Platform, public auth: AuthServiceProvider,
    public menuCtrl: MenuController, public pusherNotification: Push,
    private http: HttpClient, public event: Events,
    public zone: NgZone, public translate: TranslateService,
    private helper: HelpersProvider, public webIntent: WebIntent,
    private INoti: INotificationProvider, public splash: SplashScreen,
    private statusBar: StatusBar, private socket: WebSocketsProvider
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

  //Para cuando se cambia de pantalla
  //Enviamos los datos al api
  ngAfterViewInit() {
    // this.nav.viewDidEnter.subscribe((data: ViewController) => {
    //   console.log("change page", data)
    //   try {
    //     if (MyApp.User === null || MyApp.User === undefined) return;

    //     if (this.platform.is('cordova') &&
    //       data.component.hasOwnProperty("__name") === true &&
    //       isDevMode() === false) {

    //       let screen: any = {
    //         startTime: new Date().toISOString(),
    //         screen: data.component.__name,
    //         firstName: MyApp.User.firstName,
    //         lastName: MyApp.User.lastName,
    //         userEmail: MyApp.User.email,
    //         platform: this.platform.is("ios") ? 'ios' : 'android'
    //       };

    //       if (MyApp.User.team !== undefined && MyApp.User.team !== null) {
    //         screen.team = MyApp.User.team
    //       } else if (MyApp.User.role.league !== undefined && MyApp.User.role.league !== null) {
    //         if (Object.prototype.toString.call(MyApp.User.role.league) === "[object Object]")
    //           screen.league = MyApp.User.role.league.id;
    //         else
    //           screen.league = MyApp.User.role.league.id;
    //       }

    //       data.willUnload.subscribe(async () => {
    //         try {
    //           screen.endTime = new Date().toISOString();

    //           //Calculamos el tiempo que estuvo en la pantalla en segundos
    //           let dateTime = moment(screen.startTime),
    //             dateTimeEnd = moment(screen.endTime);
    //           let diff = moment.duration(dateTime.diff(dateTimeEnd));
    //           screen.timeVisited = Math.abs(diff.seconds());

    //           await this.http.post("/screen", screen).toPromise();
    //         }
    //         catch (e) {
    //           console.error(e);
    //         }
    //       });
    //     }
    //   }
    //   catch (e) {
    //     console.error(e);
    //   }
    // });
  }

  public async init() {
    try {
      MyApp.me = this;
      WebSocketsProvider.addFunction(true, this.serviceNewDatas, this);
      await this.initAuth();
      await MyApp.initNotifcations();
    }
    catch (e) {
      console.error(e);
    }
    this.splash.hide();
  }

  async initAuth() {

    var authenticated = await this.auth.checkUser();
    if (authenticated === true) {

      await this.proccessViews();
      //Para iniciar sesion en websocket
      await this.socket.initConexion();
      setTimeout(function () { this.auth.validSesion() }.bind(this), 10000);
    } else {
      this.nav.root = LoginPage;
    }

    //se actualiza nombre y la imagen de usuario manualmente por ngZone ni dateRef funcionan
    this.auth.changeUser(async function () {
      this.defaultImageUser = true;
      this.user = this.auth.User();

      // let team = MyApp.User.team !== undefined && MyApp.User.team !== null ? MyApp.User.team : "undefined";
      // this.userimg = interceptor.transformUrl("/userprofile/images/" + MyApp.User.id + "/" + team);
      // document.getElementById("imageSlide").setAttribute("src", this.userimg);

      this.user = MyApp.User;
      if (MyApp.User.role == undefined || MyApp.User.role == null) {

        // this.rolIdentity = "";
        // this.identity = "";
      } else if (MyApp.User.hasOwnProperty("team")) {

        //Para actualizar el nombre del equipo en menu slide
        // let team: any = await this.http.get("/teams/" + MyApp.User.team).toPromise();
        // this.rolIdentity = await this.helper.getWords("TEAM");
        // this.identity = team.name;
        if (MyApp.User.role.name === "Player" && MyApp.User.role.firstTime === undefined) {
          await this.http.put("/roles/" + MyApp.User.role.id, { firstTime: true }).toPromise()
        }
      } else {
        // let league;
        // if (Object.prototype.toString.call(MyApp.User.role.league) === "[object Object]") {
        //   league = MyApp.User.role.league;
        // } else {
        //   league = await this.http.get("/leagues/" + MyApp.User.role.league).toPromise() as any;
        // }
        // this.rolIdentity = await this.helper.getWords("LEAGUE.NAME");
        // this.identity = league.name;
      }

      //Para reconnectar con sesion en websocket
      await TabsPage.reloadMenu();
      await this.socket.reconnect();
      this.zone.run(function () {
        console.log("cambiooo", MyApp.User);
      });

    }.bind(this));

  }

  private async proccessViews() {

    this.statusBar.overlaysWebView(false);

    this.user = this.auth.User();
    MyApp.User = this.auth.User();

    this.fullName = this.user.firstName + ' ' + this.user.lastName;

    //Si es un agente libre
    if (MyApp.User.role !== undefined && MyApp.User.role !== null) {
      if (MyApp.User.role.name === 'OwnerLeague') {
        this.statusBar.backgroundColorByHexString("#32a0fe");

      } else {
        this.statusBar.backgroundColorByHexString("#fe324d");
      }
    }

    if (MyApp.User.role == undefined || MyApp.User.role == null) {

      this.nav.root = ViewProfilePage;
      this.rolIdentity = "";
      this.identity = "";
    } else if (MyApp.User.role.name === "FreeAgent") {

      this.rolIdentity = "";
      this.identity = "";
      this.nav.root = TabsPage;
    } else {

      // this.nav.root = EventsSchedulePage;
      this.nav.root = TabsPage;
      if (MyApp.User.hasOwnProperty("team")) {

        //Para actualizar el nombre del equipo en menu slide
        let team: any = await this.http.get("/teams/" + MyApp.User.team).toPromise();
        this.rolIdentity = await this.helper.getWords("TEAM");
        this.identity = team.name;
      } else {
        let league;
        if (Object.prototype.toString.call(MyApp.User.role.league) === "[object Object]") {
          league = MyApp.User.role.league;
        } else {
          league = await this.http.get("/leagues/" + MyApp.User.role.league).toPromise() as any;
        }
        this.rolIdentity = await this.helper.getWords("LEAGUE.NAME");
        this.identity = league.name;
      }

    }


    /**********
       * 
       * Para asignar la imagen en el menu
       */
    // this.userimg = interceptor.transformUrl("/userprofile/images/" + MyApp.User.id + "/" + MyApp.User.team);
    // document.getElementById("imageSlide").setAttribute("src", this.userimg);


    //ahora asignamos el lenaguaje si es que esta definido
    if (MyApp.User.hasOwnProperty('options') && MyApp.User.options.hasOwnProperty('language')) {
      await this.helper.setLanguage(MyApp.User.options.language);
    } else {
      this.helper.setLanguage('en')
    }

    this.zone.run(function () {
      console.log("user", MyApp.User);
    });

  }

  //#region Para maneja los puntos de notifications en el app, puntos rojos cuando hay algo nuevo
  private async serviceNewDatas() {
    //get new requests for managers
    if (MyApp.User === null || MyApp.User === undefined)
      return;

    //#region Para comprobar si hay nuevos request
    //Para los players
    let requestPlayer = async function () {
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
    }.bind(this);

    await requestPlayer();

    //Ahora nos subscirbemos con websocket a los nuevo request players
    //Para cuando se agrega uno nuevo
    this.socket.subscribe('request-added-' + MyApp.User.id, requestPlayer.bind(this));

    //Para cuando se actualiza un request, lo eliminamos
    this.socket.subscribe('request-updated-' + MyApp.User.id, requestPlayer.bind(this));
    //#endregion

    //#region Para saber si hay request para league
    if (MyApp.User.role !== undefined && MyApp.User.role !== null) {
      if (MyApp.User.role.name === "FreeAgent")
        return;

      if (MyApp.User.role.name === "Manager") {

        let requestLeague = async function () {
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
        }.bind(this);
        await requestLeague();

        //Para cuando se agrega uno nuevo
        this.socket.subscribe('requestLeague-added-' + MyApp.User.team, requestLeague.bind(this));

        //Para cuando se actualiza un request, lo eliminamos
        this.socket.subscribe('requestLeague-updated-' + MyApp.User.team, requestLeague.bind(this));
      }
    }
    //#endregion

    //#region Para saber si hay nuevos request para unirse a equipos
    if (MyApp.User.team !== undefined && MyApp.User.team !== null) {
      let requestTeam = async function () {
        this.team = await this.http.get("/team/profile/" + MyApp.User.team).toPromise();
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
      }.bind(this);

      await requestTeam();
      //Para cuando se agrega uno nuevo
      this.socket.subscribe('requestTeam-added-' + MyApp.User.team, requestTeam.bind(this));

      //Para cuando se actualiza un request, lo eliminamos
      this.socket.subscribe('requestTeam-updated-' + MyApp.User.team, requestTeam.bind(this));
    }


    //#endregion
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
    // if (document.querySelector("div.point-new-menu-toggle") !== null) return;

    // let div = document.createElement("div");
    // div.setAttribute("class", "point-new-menu-toggle");
    // document.querySelector("button[menutoggle]").appendChild(div);
  }

  private deletePointNewMenuToggle() {
    // if (document.querySelector("div.point-new-menu-toggle") === null) return;
    // document.querySelector("button[menutoggle]").removeChild(document.querySelector("div.point-new-menu-toggle"));
  }

  //Para obtener el nombre del usuario para mostrarlo en el menu
  public getName() {
    if (MyApp.User === null || MyApp.User === undefined) return '';

    return MyApp.User.firstName + " " + MyApp.User.lastName;
  }

  public getRolIdentity() {
    return this.identity;
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

  public errorLoadImage(e) {
    e.target.src = "./assets/imgs/user-menu.png"
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

    let valid = MyApp.User === undefined || MyApp.User === null;

    if (valid === true) {
      return false;
    }

    //El usuario puede estar sin ningun rol
    //cuando es asi no se muestra ningun item en el nav
    if (MyApp.User.role === null || MyApp.User.role === undefined) return false;

    //Para verificar si nesesita de newData, para mostrarse
    newDatas = newDatas || 'not';
    if (newDatas !== 'not') {
      if (this.newData(newDatas) === true) {
        return false;
      }
    }

    if (page.role === "*") return true;

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

    if (MyApp.me.permision === false || MyApp.User === null || MyApp.User === undefined) {
      return;
    }

    MyApp.notifcations();
  }


  //#region for push notifications configuration
  public static async notifcations() {

    //creamos los topics para subscribirse
    let topics = [];
    for (let element of MyApp.User.roles) {
      if (Object.prototype.toString.call(element.team) === "[object String]") {
        topics.push(element.team);
      } else if (Object.prototype.toString.call(element.team) === "[object Object]") {
        topics.push(element.team.id);
      }
    }

    // to initialize push notifications

    //console.log(team);
    const options: any = {
      android: {
        senderID: "318853826702",
        topics,
        sound: true,
        vibrate: true,
        soundname: "default"
      },
      ios: {
        alert: 'true',
        badge: true,
        sound: 'true',
        soundname: "default"
      },
      windows: {},
      browser: {
        pushServiceURL: 'https://locker-room-a910e.firebaseio.com'
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
    await this.processIntents();
  }

  public static async processIntents() {
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



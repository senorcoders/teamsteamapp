import { Component, ViewChild, NgZone } from '@angular/core';
import { Platform, Nav, NavController, ToastController, Toast, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { Network } from '@ionic-native/network';
import { Geolocation } from '@ionic-native/geolocation';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Push, PushObject, PushOptions } from '@ionic-native/push';

import { LoginPage } from '../pages/login/login';
import { AuthServiceProvider } from '../providers/auth-service/auth-service';
import { EventsSchedulePage } from '../pages/events-schedule/events-schedule';
import { MenuController } from 'ionic-angular/components/app/menu-controller';
import { RosterPage } from '../pages/roster/roster';
import { HttpClient } from '@angular/common/http';


import * as moment from 'moment';
import { Storage } from '@ionic/storage';
import { ChatPage } from '../pages/chat/chat';
import { interceptor } from '../providers/auth-service/interceptor';
import { MyTaskPage } from '../pages/my-task/my-task';
import { ListChatsPage } from '../pages/list-chats/list-chats';
import { ViewProfilePage } from '../pages/view-profile/view-profile';

import { TranslateService } from '@ngx-translate/core';
import { HelpersProvider } from '../providers/helpers/helpers';
import { AddTeamPage } from '../pages/add-team/add-team';
import { PrivacyPolicePage } from '../pages/privacy-police/privacy-police';
import { DateTimePickerComponent } from '../components/date-time-picker/date-time-picker';
import { bindCallback } from 'rxjs/observable/bindCallback';
import { ChatOnePersonPage } from '../pages/chat-one-person/chat-one-person';
import { eachDay } from 'date-fns';
import { WebIntent } from '@ionic-native/web-intent';
import { EventPage } from '../pages/event/event';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild('mycontent') nav: Nav;

  public static me: MyApp;
  private disconnectSubscription: any;

  private static notificationEnable: boolean = false;
  private static httpCliente: HttpClient;
  private static authService: AuthServiceProvider;
  private static pusherNotification: Push;
  private static permision: boolean = false;
  public static User: any;
  public static pushObject: PushObject;
  private static event: Events;

  public nameReady = false;
  public teamName = "";

  public user: any = {
    username: ""
  };

  public toas: Toast;
  public team: any;

  public username = "Senorcoders";
  public userimg = "./assets/imgs/user.jpg";
  public logo = "./assets/imgs/logo-sign.png";
  public defaultImageUserUrl = "./assets/imgs/user-menu.png";
  public defaultImageUser = true;

  public pages: Array<Object> = [
    { title: "NAVMENU.EVENTS", component: EventsSchedulePage, icon: "basketball", role: "*" },
    { title: "NAVMENU.MYTASK", component: MyTaskPage, icon: "basketball", role: "*" },
    { title: "NAVMENU.ROSTER", component: RosterPage, icon: "baseball", role: "*" },
    { title: "NAVMENU.MESSAGES", component: ListChatsPage, icon: "baseball", role: "*" },
    { title: "NEWTEAM.ADD", component: AddTeamPage, icon: "baseball", role: "*" }
  ];

  constructor(public platform: Platform, statusBar: StatusBar,
    splashScreen: SplashScreen, public auth: AuthServiceProvider,
    public menuCtrl: MenuController, public geolocation: Geolocation,
    private network: Network, public toast: ToastController,
    private locationAccuracy: LocationAccuracy, private push: Push,
    private http: HttpClient, private Evenn: Events,
    public zone: NgZone, translate: TranslateService,
    private helper: HelpersProvider, public webIntent: WebIntent
  ) {

    //servicios que nesesitaran otros componentes per o que nesesitan la participacion del app
    MyApp.httpCliente = this.http;
    MyApp.authService = this.auth;
    MyApp.pusherNotification = this.push;
    MyApp.event = this.Evenn;
    this.init();

    let t = this;
    platform.ready().then(() => {
      translate.setDefaultLang('en');

      // the lang to use, if the lang isn't available, it will use the current loader to get them
      translate.use('es');

      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.overlaysWebView(false);
      statusBar.backgroundColorByHexString("#008e76");
      splashScreen.hide();

      t.push.hasPermission()
        .then((res: any) => {

          if (res.isEnabled) {
            console.log('We have permission to send push notifications');
            MyApp.permision = true;
          } else {
            console.log('We do not have permission to send push notifications');
          }

        });

    });

    this.toas = this.toast.create({
      message: " Internet connection is required",
      showCloseButton: true,
      position: "bottom"
    });

    //se ejecuta cuando se conecta a internet
    this.network.onConnect().subscribe(data => {
      this.toas.dismiss();
      console.log(data);
    }, error => console.error(error));

    //se ejecuta cuando se desconecta de internet
    //se muestra al usuario que debe estar conectado
    this.network.onDisconnect().subscribe(data => {
      console.log(data)
      this.toas.present();
    }, error => console.error(error));

  }

  public init() {
    MyApp.me = this;
  }

  async ngOnInit() {

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
      //document.getElementById("nameSlide").innerText = this.user.username;

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
    let t = this;
    this.auth.changeUser(function () {

      this.defaultImageUser = true;
      this.user = t.auth.User();

      console.log("cambiooo", t.user);
      let ramdon = new Date().getTime();
      this.userimg = interceptor.transformUrl("/images/" + ramdon + "/users&thumbnail/" + t.user.id);
      document.getElementById("imageSlide").setAttribute("src", t.userimg);
      //document.getElementById("nameSlide").innerText = t.user.username;
      this.user = MyApp.User;
    }.bind(this));
  }

  public loadImageMenu() {
    this.defaultImageUser = false;
  }


  /**
   * logout
   */
  public async logout() {
    var response = await this.auth.logout();
    if (response === true) {
      this.nav.root = LoginPage;
    }
    this.menuCtrl.close();
  }

  goToPage(page) {
    this.nav.setRoot(page);
    this.menuCtrl.close();
  }

  public goProfile() {
    this.nav.setRoot(ViewProfilePage);
    this.menuCtrl.close();
  }

  public validRolePage(page) {

    if (page.role === "*") return true;

    let valid = MyApp.User === undefined || MyApp.User === null;

    if (valid === true) {
      return true;
    }
    //console.log(MyApp.User.role.name, page.role);
    return MyApp.User.role.name === page.role;
  }

  public static async initNotifcations() {

    if (MyApp.notificationEnable === true && MyApp.permision === false) {
      return;
    }

    MyApp.notifcations(MyApp.User.team);

  }


  //#region for push notifications configuration
  public static async notifcations(team) {

    // Return a list of currently configured channels
    MyApp.pusherNotification.listChannels().then((channels) => console.log('List of channels', channels))

    // to initialize push notifications

    //console.log(team);
    const options: any = {
      android: {
        senderID: "414026305021",
        topics: [team],
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
        pushServiceURL: 'https://serviciosrivenses.firebaseio.com'
      }
    };

    try {

      //#region for notification in team
      MyApp.pushObject = MyApp.pusherNotification.init(options);

      MyApp.pushObject.on('notification').subscribe(async (notification: any) => {
        console.log(notification);

        let verb = notification.additionalData.verb, is = notification.additionalData.is;

        MyApp.event.publish(is + ":" + verb, notification.additionalData.dataStringify, Date.now());
        console.log('Received a notification', notification);


      });

      MyApp.pushObject.on('registration').subscribe((registration: any) => {

        if (MyApp.User.tokenReady === true) {
          MyApp.notificationEnable = true;
          return;
        }
        MyApp.notificationEnable = true;
        MyApp.authService.updateTokenReg(registration.registrationId);
        console.log('Device registered', registration);
      });

      MyApp.pushObject.on('error').subscribe(error => console.error('Error with Push plugin', error));
      //#endregion

    }
    catch (e) {
      console.error(e);
    }

    //#endregion

    //#region para cuando se toca una notification y el app esta cerrada y entra
    try {
      let intents = await MyApp.me.webIntent.getIntent();
      MyApp.me.processNotification(intents);
    }
    catch (e) {
      console.error(e);
    }
    //#endregion

    //#region cuando se toca una notification y el app esta en background
    MyApp.me.webIntent.onIntent().subscribe(function (intent) {
      MyApp.me.processNotification(intent);
    }, console.error);
    //#endregion

  }

  public async processNotification(intent) {

    console.log(intent);

    if (!intent.hasOwnProperty("extras") || !intent.extras.hasOwnProperty("is")) {
      return;
    }

    let data = JSON.parse(intent.extras.dataStringify);
    if (intent.extras.is === "chat") {
      await HelpersProvider.me.toPages(ListChatsPage, [{ page: ChatOnePersonPage, data: { user: data.from } }]);
    }else if(intent.extras.is === "event"){
      await HelpersProvider.me.toPages(EventsSchedulePage, [{ page: EventPage, data: { event: data.eventData } }]);
    }

  }

}


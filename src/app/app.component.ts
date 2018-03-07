import { Component, ViewChild } from '@angular/core';
import { Platform, Nav, NavController, ToastController, Toast, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { Network } from '@ionic-native/network';
import { Geolocation } from '@ionic-native/geolocation';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Push, PushObject, PushOptions } from '@ionic-native/push';

import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { AuthServiceProvider } from '../providers/auth-service/auth-service';
import { EventsSchedulePage } from '../pages/events-schedule/events-schedule';
import { MenuController } from 'ionic-angular/components/app/menu-controller';
import { OfflinePage } from '../pages/offline/offline';
import { RosterPage } from '../pages/roster/roster';
import { HttpClient } from '@angular/common/http';

import * as moment from 'moment';
import { Storage } from '@ionic/storage';
import { ChatPage } from '../pages/chat/chat';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild('mycontent') nav:Nav;

  private disconnectSubscription:any;

  private static notificationEnable:boolean=false;
  private static httpCliente:HttpClient;
  private static authService: AuthServiceProvider;
  private static pusherNotification:Push;
  private static permision:boolean=false;
  public static User:any;

  public user:any={
    username: "SenorCoders"
  };

  public toas:Toast;
  public team:any;

  public username="Senorcoders";
  public userimg="./assets/imgs/user.jpg";
  public logo="./assets/imgs/logo-sign.png";
  public pages:Array<Object> = [
    { title : "Events", component : EventsSchedulePage, icon:"basketball" },
    { title : "Roster", component : RosterPage, icon:"baseball" },
    { title : "Chat", component : ChatPage, icon:"baseball" }
   ];

  constructor(platform: Platform, statusBar: StatusBar, 
    splashScreen: SplashScreen, public auth: AuthServiceProvider,
    public menuCtrl: MenuController, public geolocation: Geolocation,
    private network: Network, public toast: ToastController,
    private locationAccuracy: LocationAccuracy, private push: Push,
    private http: HttpClient
  ) {

    MyApp.httpCliente= this.http;
    MyApp.authService = this.auth;
    MyApp.pusherNotification = this.push;

    let t = this;
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();

      if( platform.is("android") || platform.is("ios") ){
        t.locationAccuracy.canRequest().then((canRequest: boolean) => {

          if(canRequest) {
            // the accuracy option will be ignored by iOS
            t.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
              () =>{
                t.getLocationDebug();
              } ,
              error => console.log('Error requesting location permissions', error)
            );
          }

        });
      }
      
      t.push.hasPermission()
      .then((res: any) => {

        if (res.isEnabled) {
          console.log('We have permission to send push notifications');
          MyApp.permision=true;
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

    this.network.onConnect().subscribe(data => {
      this.toas.dismiss();
      console.log(data);
    }, error => console.error(error));
   
    this.network.onDisconnect().subscribe(data => {
      console.log(data)
      this.toas.present();
    }, error => console.error(error));

  }

  async ngOnInit(){
    var authenticated = await this.auth.checkUser();
    if( authenticated === true ){
      this.nav.root = EventsSchedulePage;
      this.user = this.auth.User();
      MyApp.User = this.auth.User();
    }else{
      this.nav.root = LoginPage;
      return;
    }

  }

  private getLocationDebug(){

    this.geolocation.getCurrentPosition().then((resp) => {
      // resp.coords.latitude
      // resp.coords.longitude
      console.log(resp.coords.latitude, resp.coords.longitude);
     }).catch((error) => {
       console.log('Error getting location', error);
     });
  }

  /**
   * logout
   */
  public async logout() {
    var response = await this.auth.logout();
    if( response === true ){
      this.nav.root = LoginPage;
    }
    this.menuCtrl.close();
  }

  goToPage(page){
    this.nav.setRoot(page);
    this.menuCtrl.close();
  }

  public static async initNotifcations(){

    if( MyApp.notificationEnable === true && MyApp.permision === false ){
      return;
    }

    MyApp.notifcations(MyApp.User.team);

  }


  //#region for push notifications configuration
  private static notifcations(team){

    // Create a channel (Android O and above). You'll need to provide the id, description and importance properties.
    /*this.push.createChannel({
      id: "testchannel1",
      description: "My first test channel",
      // The importance property goes from 1 = Lowest, 2 = Low, 3 = Normal, 4 = High and 5 = Highest.
      importance: 3
    }).then(() => console.log('Channel created'));*/
    
    // Delete a channel (Android O and above)
    //this.push.deleteChannel('testchannel1').then(() => console.log('Channel deleted'));
    
    // Return a list of currently configured channels
    MyApp.pusherNotification.listChannels().then((channels) => console.log('List of channels', channels))
    
    // to initialize push notifications

    console.log(team);
    const options: PushOptions = {
        android: {
          senderID: "414026305021",
          topics: [team]
        },
        ios: {
            alert: 'true',
            badge: true,
            sound: 'false'
        },
        windows: {},
        browser: {
            pushServiceURL: 'https://serviciosrivenses.firebaseio.com'
        }
    };
    
    const pushObject: PushObject = MyApp.pusherNotification.init(options);
    
    
    pushObject.on('notification').subscribe((notification: any) =>{
      //ChatPage.eventChat(notification.additionalData);
      new Events().publish('chat:received', notification.additionalData);
      console.log('Received a notification', notification);
    })
    
    pushObject.on('registration').subscribe((registration: any) => {
      MyApp.notificationEnable=true;
      console.log('Device registered', registration);
    });
    
    
    pushObject.on('error').subscribe(error => console.error('Error with Push plugin', error));
  }

  //#endregion

}


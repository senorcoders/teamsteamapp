import { Component, ViewChild } from '@angular/core';
import { Platform, Nav, NavController, ToastController, Toast } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { Network } from '@ionic-native/network';

import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { AuthServiceProvider } from '../providers/auth-service/auth-service';
import { EventsSchedulePage } from '../pages/events-schedule/events-schedule';
import { MenuController } from 'ionic-angular/components/app/menu-controller';
import { OfflinePage } from '../pages/offline/offline';
import { RosterPage } from '../pages/roster/roster';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild('mycontent') nav:Nav;

  private disconnectSubscription:any;

  public user:any={
    username: "SenorCoders"
  };

  public toas:Toast;

  public username="Senorcoders";
  public userimg="./assets/imgs/user.jpg";
  public logo="./assets/imgs/logo-sign.png";
  public pages:Array<Object> = [
    { title : "Events", component : EventsSchedulePage, icon:"basketball" },
    { title : "Roster", component : RosterPage, icon:"baseball" }
   ];

  constructor(platform: Platform, statusBar: StatusBar, 
    splashScreen: SplashScreen, 
    public auth: AuthServiceProvider,
    public menuCtrl: MenuController,
    private network: Network, public toast: ToastController) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
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
    }else{
      this.nav.root = LoginPage;
    }
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

}


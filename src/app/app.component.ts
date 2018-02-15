import { Component, ViewChild } from '@angular/core';
import { Platform, Nav } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { Network } from '@ionic-native/network';

import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { AuthServiceProvider } from '../providers/auth-service/auth-service';
import { EventsSchedulePage } from '../pages/events-schedule/events-schedule';
import { MenuController } from 'ionic-angular/components/app/menu-controller';
import { OfflinePage } from '../pages/offline/offline';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild('mycontent') nav:Nav;

  private disconnectSubscription:any;

  public pages:Array<Object> = [
    { title : "Events", component : EventsSchedulePage }
   ];

  constructor(platform: Platform, statusBar: StatusBar, 
    splashScreen: SplashScreen, 
    public auth: AuthServiceProvider,
    public menuCtrl: MenuController,
    private network: Network) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });

    /*this.disconnectSubscription = this.network.onDisconnect().subscribe(() => {
      this.nav.push(OfflinePage);
      this.menuCtrl.swipeEnable(false);
    });

    
    this.network.onConnect().subscribe(function(){
      console.log(this.nav.getViews() );
      if( this.nav.getViews() ){

      }
      this.nav.pop();
    });*/

  }

  async ngOnInit(){
    var authenticated = await this.auth.checkUser();
    if( authenticated === true ){
      this.nav.root = EventsSchedulePage;
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


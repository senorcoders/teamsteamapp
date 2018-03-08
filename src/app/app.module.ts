import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { HttpClientModule, HttpRequest, HTTP_INTERCEPTORS } from '@angular/common/http';

//Tools
import { IonicStorageModule } from '@ionic/storage';
import { Camera } from '@ionic-native/camera';
import { IonicImageLoader } from 'ionic-image-loader';
import { GoogleMaps } from '@ionic-native/google-maps';
import { Geolocation } from '@ionic-native/geolocation';
import { LocationAccuracy } from '@ionic-native/location-accuracy';


import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { AuthServiceProvider } from '../providers/auth-service/auth-service';
import { interceptor } from '../providers/auth-service/interceptor';
import { LoginPage } from '../pages/login/login';
import { HttpClient } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { EventsSchedulePage } from '../pages/events-schedule/events-schedule';
import { Network } from '@ionic-native/network';
import { RosterPage } from '../pages/roster/roster';
import { MemberRosterPage } from '../pages/member-roster/member-roster';
import { EventPage } from '../pages/event/event';
import { AddFamilyPage } from '../pages/add-family/add-family';
import { ViewPlayerPage } from '../pages/view-player/view-player';
import { EditFamilyPage } from '../pages/edit-family/edit-family';
import { CreatePlayerPage } from '../pages/create-player/create-player';
import { CreatePlayerDetailsPage } from '../pages/create-player-details/create-player-details';
import { NewEventPage } from '../pages/new-event/new-event';
import { EditEventPage } from '../pages/edit-event/edit-event';
import { HelpersProvider } from '../providers/helpers/helpers';

import { Push } from '@ionic-native/push';
import { ChatPage } from '../pages/chat/chat';
import { EmojiProvider } from '../providers/emoji/emoji';
import { RelativeTimePipe } from '../pipes/relative-time/relative-time';
import { EmojiPickerComponent } from '../components/emoji-picker/emoji-picker';
@NgModule({
  declarations: [
    MyApp,
    HomePage,
    LoginPage,
    EventsSchedulePage,
    RosterPage,
    MemberRosterPage,
    EventPage,
    ViewPlayerPage,
    AddFamilyPage,
    EditFamilyPage,
    CreatePlayerPage,
    CreatePlayerDetailsPage,
    NewEventPage,
    EditEventPage,
    ChatPage,
    RelativeTimePipe,
    EmojiPickerComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot({
      name: 'teamsnap',
         driverOrder: ['indexeddb', 'sqlite', 'websql']
    }),
    IonicImageLoader.forRoot(),
    HttpModule,
    HttpClientModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    LoginPage,
    EventsSchedulePage,
    RosterPage,
    MemberRosterPage,
    EventPage,
    ViewPlayerPage,
    AddFamilyPage,
    EditFamilyPage,
    CreatePlayerPage,
    CreatePlayerDetailsPage,
    NewEventPage,
    EditEventPage,
    ChatPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Network,
    Camera,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    { provide: HTTP_INTERCEPTORS, useClass: interceptor, multi: true },
    AuthServiceProvider,
    interceptor,
    GoogleMaps,
    Geolocation,
    LocationAccuracy,
    HelpersProvider,
    Push,
    EmojiProvider
  ]
})
export class AppModule {}

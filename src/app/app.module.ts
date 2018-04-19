import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { HttpClientModule, HttpRequest, HTTP_INTERCEPTORS } from '@angular/common/http';

//Tools
import { IonicStorageModule } from '@ionic/storage';
import { GoogleMaps } from '@ionic-native/google-maps';
import { Geolocation } from '@ionic-native/geolocation';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { AndroidFullScreen } from '@ionic-native/android-full-screen';
import { NativeGeocoder } from '@ionic-native/native-geocoder';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { DatePicker } from '@ionic-native/date-picker';
import { LongPressModule } from 'ionic-long-press';
import { TranslateModule } from '@ngx-translate/core';

import { MyApp } from './app.component';
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
import { CameraPage } from '../pages/camera/camera';
import { CameraPreview } from '@ionic-native/camera-preview';
import { Diagnostic } from '@ionic-native/diagnostic';
import { File } from '@ionic-native/file';
import { PhotoLibrary } from '@ionic-native/photo-library';
import { LibraryImagesPage } from '../pages/library-images/library-images';
import { ItemDetailsPage } from '../pages/item-details/item-details';
import { PermissionsPage } from '../pages/permissions/permissions';
import { CDVPhotoLibraryPipe } from '../pipes/cdvphotolibrary/cdvphotolibrary.pipe';
import { GoogleMapsComponent } from '../components/google-maps/google-maps';
import { PlacePipe } from '../pipes/place/place';
import { CommentsComponent } from '../components/comments/comments';
import { ViewLikesComponent } from '../components/view-likes/view-likes';
import { ViewTrakingComponent } from '../components/view-traking/view-traking';
import { MyTaskPage } from '../pages/my-task/my-task';
import { NewTaskPage } from '../pages/new-task/new-task';
import { TaskPage } from '../pages/task/task';
import { ChatOnePersonPage } from '../pages/chat-one-person/chat-one-person';
import { ListChatsPage } from '../pages/list-chats/list-chats';
import { SelectNewChatComponent } from '../components/select-new-chat/select-new-chat';
import { TrackingEventComponent } from '../components/tracking-event/tracking-event';
import { TrackingEventManagerComponent } from '../components/tracking-event-manager/tracking-event-manager';
import { ToChatToPerfilPlayerComponent } from '../components/to-chat-to-perfil-player/to-chat-to-perfil-player';
import { ViewProfilePage } from '../pages/view-profile/view-profile';
import { WebSocketsProvider } from '../providers/web-sockets/web-sockets';

//for  multilanguage
import { TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { Http } from '@angular/http';
import { ContactsProfilePage } from '../pages/contacts-profile/contacts-profile';
import { TeamsProfilePage } from '../pages/teams-profile/teams-profile';
import { AddTeamPage } from '../pages/add-team/add-team';
import { SearchTeamsPage } from '../pages/search-teams/search-teams';
import { ViewTeamPage } from '../pages/view-team/view-team';
import { PrivacyPolicePage } from '../pages/privacy-police/privacy-police';
import { ViewRequestPage } from '../pages/view-request/view-request';
import { ViewRequestsPage } from '../pages/view-requests/view-requests';
import { FormJoinTeamPage } from '../pages/form-join-team/form-join-team';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    EventsSchedulePage,
    RosterPage,
    MemberRosterPage,
    EventPage,
    ViewPlayerPage,
    EditFamilyPage,
    CreatePlayerPage,
    CreatePlayerDetailsPage,
    NewEventPage,
    EditEventPage,
    ChatPage,
    RelativeTimePipe,
    PlacePipe,
    EmojiPickerComponent,
    GoogleMapsComponent,
    CameraPage,
    LibraryImagesPage,
    ItemDetailsPage,
    PermissionsPage,
    CDVPhotoLibraryPipe,
    CommentsComponent,
    ViewLikesComponent,
    ViewTrakingComponent,
    MyTaskPage,
    NewTaskPage,
    TaskPage,
    ChatOnePersonPage,
    ListChatsPage,
    SelectNewChatComponent,
    TrackingEventComponent,
    TrackingEventManagerComponent,
    ToChatToPerfilPlayerComponent,
    ViewProfilePage,
    ContactsProfilePage,
    TeamsProfilePage,
    AddTeamPage,
    SearchTeamsPage,
    ViewTeamPage,
    PrivacyPolicePage,
    ViewRequestPage,
    ViewRequestsPage,
    FormJoinTeamPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot({
      name: 'teamsnap',
         driverOrder: ['indexeddb', 'sqlite', 'websql']
    }),
    HttpModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: (HttpLoaderFactory),
          deps: [HttpClient]
      }
    }),
    LongPressModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    EventsSchedulePage,
    RosterPage,
    MemberRosterPage,
    EventPage,
    ViewPlayerPage,
    EditFamilyPage,
    CreatePlayerPage,
    CreatePlayerDetailsPage,
    NewEventPage,
    EditEventPage,
    ChatPage,
    CameraPage,
    LibraryImagesPage,
    ItemDetailsPage,
    PermissionsPage,
    GoogleMapsComponent,
    CommentsComponent,
    ViewLikesComponent,
    ViewTrakingComponent,
    MyTaskPage,
    NewTaskPage,
    TaskPage,
    ChatOnePersonPage,
    ListChatsPage,
    SelectNewChatComponent,
    TrackingEventComponent,
    TrackingEventManagerComponent,
    ToChatToPerfilPlayerComponent,
    ViewProfilePage,
    ContactsProfilePage,
    TeamsProfilePage,
    AddTeamPage,
    SearchTeamsPage,
    ViewTeamPage,
    PrivacyPolicePage,
    ViewRequestPage,
    ViewRequestsPage,
    FormJoinTeamPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Network,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    { provide: HTTP_INTERCEPTORS, useClass: interceptor, multi: true },
    AuthServiceProvider,
    interceptor,
    GoogleMaps,
    Geolocation,
    LocationAccuracy,
    HelpersProvider,
    Push,
    EmojiProvider,
    CameraPreview,
    File,
    Diagnostic,
    PhotoLibrary,
    AndroidFullScreen,
    NativeGeocoder,
    PhotoViewer,
    DatePicker,
    WebSocketsProvider
  ]
})
export class AppModule {}

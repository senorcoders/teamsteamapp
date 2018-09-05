import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

//Tools
import { IonicStorageModule } from '@ionic/storage';
import { Geolocation } from '@ionic-native/geolocation';
import { DatePicker } from '@ionic-native/date-picker';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { WebIntent } from '@ionic-native/web-intent';
import { Device } from '@ionic-native/device';
import { Globalization } from '@ionic-native/globalization';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { LocationAccuracy } from '@ionic-native/location-accuracy';


import { MyApp } from './app.component';
import { AuthServiceProvider } from '../providers/auth-service/auth-service';
import { interceptor } from '../providers/auth-service/interceptor';
import { LoginPage } from '../pages/login/login';
import { HttpClient } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { EventsSchedulePage } from '../pages/events-schedule/events-schedule';
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
import { CameraPage } from '../pages/camera/camera';
import { CameraPreview } from '@ionic-native/camera-preview';
import { Diagnostic } from '@ionic-native/diagnostic';
import { PhotoLibrary } from '@ionic-native/photo-library';
import { LibraryImagesPage } from '../pages/library-images/library-images';
import { ItemDetailsPage } from '../pages/item-details/item-details';
import { PermissionsPage } from '../pages/permissions/permissions';
import { MyTaskPage } from '../pages/my-task/my-task';
import { NewTaskPage } from '../pages/new-task/new-task';
import { TaskPage } from '../pages/task/task';
import { ChatOnePersonPage } from '../pages/chat-one-person/chat-one-person';
import { ListChatsPage } from '../pages/list-chats/list-chats';
import { ViewProfilePage } from '../pages/view-profile/view-profile';
import { WebSocketsProvider } from '../providers/web-sockets/web-sockets';
import { File } from '@ionic-native/file';

//for  multilanguage
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ContactsProfilePage } from '../pages/contacts-profile/contacts-profile';
import { TeamsProfilePage } from '../pages/teams-profile/teams-profile';
import { AddTeamPage } from '../pages/add-team/add-team';
import { SearchTeamsPage } from '../pages/search-teams/search-teams';
import { ViewTeamPage } from '../pages/view-team/view-team';
import { PrivacyPolicePage } from '../pages/privacy-police/privacy-police';
import { ViewRequestPage } from '../pages/view-request/view-request';
import { ViewRequestsPage } from '../pages/view-requests/view-requests';
import { FormJoinTeamPage } from '../pages/form-join-team/form-join-team';
import { RegistrationPage } from '../pages/registration/registration';
import { PaymentSubscripcionPage } from '../pages/payment-subscripcion/payment-subscripcion';
import { CheckPaidPage } from '../pages/check-paid/check-paid';
import { PaymentMonthlyPage } from '../pages/payment-monthly/payment-monthly';
import { AsignPaymentPage } from '../pages/asign-payment/asign-payment';
import { ListPlayersPaymentPage } from '../pages/list-players-payment/list-players-payment';
import { ViewPaymentsPlayerPage } from '../pages/view-payments-player/view-payments-player';
import { PaymentPage } from '../pages/payment/payment';
import { FormPlayerRegistrationPage } from '../pages/form-player-registration/form-player-registration';
import { ForgotPasswordPage } from '../pages/forgot-password/forgot-password';
import { ResetPasswordPage } from '../pages/reset-password/reset-password';
import { Camera } from '@ionic-native/camera';
import { ComponentsModule } from '../components/components.module';
import { DateTimePickerComponent } from '../components/date-time-picker/date-time-picker';
import { CommentsComponent } from '../components/comments/comments';
import { ViewLikesComponent } from '../components/view-likes/view-likes';
import { ViewTrakingComponent } from '../components/view-traking/view-traking';
import { SelectNewChatComponent } from '../components/select-new-chat/select-new-chat';
import { TrackingEventComponent } from '../components/tracking-event/tracking-event';
import { TrackingEventManagerComponent } from '../components/tracking-event-manager/tracking-event-manager';
import { ToChatToPerfilPlayerComponent } from '../components/to-chat-to-perfil-player/to-chat-to-perfil-player';
import { AsingpaymentComponent } from '../components/asingpayment/asingpayment';
import { AddTeamPageModule } from '../pages/add-team/add-team.module';
import { PipesModule } from '../pipes/pipes.module';
import { LoginPageModule } from '../pages/login/login.module';
import { EventsSchedulePageModule } from '../pages/events-schedule/events-schedule.module';
import { RosterPageModule } from '../pages/roster/roster.module';
import { MemberRosterPageModule } from '../pages/member-roster/member-roster.module';
import { EventPageModule } from '../pages/event/event.module';
import { ViewPlayerPageModule } from '../pages/view-player/view-player.module';
import { EditFamilyPageModule } from '../pages/edit-family/edit-family.module';
import { CreatePlayerPageModule } from '../pages/create-player/create-player.module';
import { CreatePlayerDetailsPageModule } from '../pages/create-player-details/create-player-details.module';
import { NewEventPageModule } from '../pages/new-event/new-event.module';
import { EditEventPageModule } from '../pages/edit-event/edit-event.module';
import { ChatPageModule } from '../pages/chat/chat.module';
import { CameraPageModule } from '../pages/camera/camera.module';
import { LibraryImagesPageModule } from '../pages/library-images/library-images.module';
import { ItemDetailsPageModule } from '../pages/item-details/item-details.module';
import { PermissionsPageModule } from '../pages/permissions/permissions.module';
import { MyTaskPageModule } from '../pages/my-task/my-task.module';
import { NewTaskPageModule } from '../pages/new-task/new-task.module';
import { TaskPageModule } from '../pages/task/task.module';
import { ChatOnePersonPageModule } from '../pages/chat-one-person/chat-one-person.module';
import { ListChatsPageModule } from '../pages/list-chats/list-chats.module';
import { ViewProfilePageModule } from '../pages/view-profile/view-profile.module';
import { ContactsProfilePageModule } from '../pages/contacts-profile/contacts-profile.module';
import { TeamsProfilePageModule } from '../pages/teams-profile/teams-profile.module';
import { SearchTeamsPageModule } from '../pages/search-teams/search-teams.module';
import { SearchTeamPageModule } from '../pages/search-team/search-team.module';
import { ViewTeamPageModule } from '../pages/view-team/view-team.module';
import { PrivacyPolicePageModule } from '../pages/privacy-police/privacy-police.module';
import { ViewRequestPageModule } from '../pages/view-request/view-request.module';
import { ViewRequestsPageModule } from '../pages/view-requests/view-requests.module';
import { FormJoinTeamPageModule } from '../pages/form-join-team/form-join-team.module';
import { RegistrationPageModule } from '../pages/registration/registration.module';
import { PaymentSubscripcionPageModule } from '../pages/payment-subscripcion/payment-subscripcion.module';
import { CheckPaidPageModule } from '../pages/check-paid/check-paid.module';
import { PaymentMonthlyPageModule } from '../pages/payment-monthly/payment-monthly.module';
import { AsignPaymentPageModule } from '../pages/asign-payment/asign-payment.module';
import { ListPlayersPaymentPageModule } from '../pages/list-players-payment/list-players-payment.module';
import { ViewPaymentsPlayerPageModule } from '../pages/view-payments-player/view-payments-player.module';
import { PaymentPageModule } from '../pages/payment/payment.module';
import { FormPlayerRegistrationPageModule } from '../pages/form-player-registration/form-player-registration.module';
import { ForgotPasswordPageModule } from '../pages/forgot-password/forgot-password.module';
import { ResetPasswordPageModule } from '../pages/reset-password/reset-password.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { PreviewImageChatComponent } from '../components/preview-image-chat/preview-image-chat';
import { INotificationProvider } from '../providers/i-notification/i-notification';
import { AssistenceComponent } from '../components/assistence/assistence';
import { AssistencesComponent } from '../components/assistences/assistences';
import { EventCreatedComponent } from '../components/event-created/event-created';
import { CalendarModule } from "ion2-calendar";
import { EmojiPickerComponentModule } from '../components/emoji-picker/emoji-picker.module';
import { ImageViewPageModule } from '../pages/image-view/image-view.module';
import { ImageViewPage } from '../pages/image-view/image-view';
import { PlayerCloseEventPage } from '../pages/player-close-event/player-close-event';
import { PlayerCloseEventPageModule } from '../pages/player-close-event/player-close-event.module';
import { AddLocationUserFreeComponent } from '../components/add-location-user-free/add-location-user-free';
import { AgentFreePageModule } from '../pages/agent-free/agent-free.module';
import { AgentFreePage } from '../pages/agent-free/agent-free';
import { PlacesPlayerFreePageModule } from '../pages/places-player-free/places-player-free.module';
import { PlacesPlayerFreePage } from '../pages/places-player-free/places-player-free';
import { EventTeamJoinPageModule } from '../pages/event-team-join/event-team-join.module';
import { EventTeamJoinPage } from '../pages/event-team-join/event-team-join';
import { RequestsPlayerPageModule } from '../pages/requests-player/requests-player.module';
import { RequestPlayerPageModule } from '../pages/request-player/request-player.module';
import { RequestsPlayerPage } from '../pages/requests-player/requests-player';
import { RequestPlayerPage } from '../pages/request-player/request-player';
import { CreateLeaguePageModule } from '../pages/create-league/create-league.module';
import { CreateLeaguePage } from '../pages/create-league/create-league';
import { SelectOwnerLeaguePageModule } from '../pages/select-owner-league/select-owner-league.module';
import { SelectOwnerLeaguePage } from '../pages/select-owner-league/select-owner-league';
import { AddTeamsLeagueComponent } from '../components/add-teams-league/add-teams-league';
import { CreateTeamManagerPageModule } from '../pages/create-team-manager/create-team-manager.module';
import { CreateTeamManagerPage } from '../pages/create-team-manager/create-team-manager';
import { TeamsLeaguePageModule } from '../pages/teams-league/teams-league.module';
import { TeamsLeaguePage } from '../pages/teams-league/teams-league';
import { SelectLeaguesPageModule } from '../pages/select-leagues/select-leagues.module';
import { SelectLeaguesPage } from '../pages/select-leagues/select-leagues';
import { RosterLeaguePage } from '../pages/roster-league/roster-league';
import { RosterLeaguePageModule } from '../pages/roster-league/roster-league.module';
import { SettingPage } from '../pages/setting/setting';
import { SettingPageModule } from '../pages/setting/setting.module';
import { RequestLeaguePageModule } from '../pages/request-league/request-league.module';
import { RequestLeaguePage } from '../pages/request-league/request-league';
import { RequestsLeaguePage } from '../pages/requests-league/requests-league';
import { RequestsLeaguePageModule } from '../pages/requests-league/requests-league.module';
import { ChatFamilyPage } from '../pages/chat-family/chat-family';
import { ChatFamilyPageModule } from '../pages/chat-family/chat-family.module';
import { ImagesEventPageModule } from '../pages/images-event/images-event.module';
import { ImagesEventPage } from '../pages/images-event/images-event';
import { UploadMultiplesImagesPageModule } from '../pages/upload-multiples-images/upload-multiples-images.module';
import { UploadMultiplesImagesPage } from '../pages/upload-multiples-images/upload-multiples-images';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot({
      name: 'teamsnap',
        driverOrder: ['sqlite', 'indexeddb', 'websql']
    }),
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: (HttpLoaderFactory),
          deps: [HttpClient]
      }
    }),
    HttpModule,
    HttpClientModule,
    ComponentsModule,
    AddTeamPageModule,
    PipesModule,
    LoginPageModule,
    EventsSchedulePageModule,
    RosterPageModule,
    MemberRosterPageModule,
    EventPageModule,
    ViewPlayerPageModule,
    EditFamilyPageModule,
    CreatePlayerPageModule,
    CreatePlayerDetailsPageModule,
    NewEventPageModule,
    EditEventPageModule,
    AgentFreePageModule,
    ChatPageModule,
    CameraPageModule,
    LibraryImagesPageModule,
    ItemDetailsPageModule,
    PermissionsPageModule,
    MyTaskPageModule,
    NewTaskPageModule,
    TaskPageModule,
    ChatOnePersonPageModule,
    ListChatsPageModule,
    ViewProfilePageModule,
    ContactsProfilePageModule,
    TeamsProfilePageModule,
    SearchTeamsPageModule,
    SearchTeamPageModule,
    ViewTeamPageModule,
    PrivacyPolicePageModule,
    ViewRequestPageModule,
    ViewRequestsPageModule,
    FormJoinTeamPageModule,
    RegistrationPageModule,
    PaymentSubscripcionPageModule,
    CheckPaidPageModule,
    PaymentMonthlyPageModule,
    AsignPaymentPageModule,
    ListPlayersPaymentPageModule,
    ViewPaymentsPlayerPageModule,
    PaymentPageModule,
    FormPlayerRegistrationPageModule,
    ForgotPasswordPageModule,
    ResetPasswordPageModule,
    PipesModule,
    CalendarModule,
    EmojiPickerComponentModule,
    ImageViewPageModule,
    PlayerCloseEventPageModule,
    PlacesPlayerFreePageModule,
    EventTeamJoinPageModule,
    RequestsPlayerPageModule,
    RequestPlayerPageModule,
    CreateLeaguePageModule,
    SelectOwnerLeaguePageModule,
    CreateTeamManagerPageModule,
    TeamsLeaguePageModule,
    SelectLeaguesPageModule,
    RosterLeaguePageModule,
    SettingPageModule,
    RequestLeaguePageModule,
    RequestsLeaguePageModule,
    ChatFamilyPageModule,
    ImagesEventPageModule,
    UploadMultiplesImagesPageModule
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
    FormJoinTeamPage,
    RegistrationPage,
    PaymentSubscripcionPage,
    CheckPaidPage,
    PaymentMonthlyPage,
    AsignPaymentPage,
    ListPlayersPaymentPage,
    AsingpaymentComponent,
    ViewPaymentsPlayerPage,
    PaymentPage,
    FormPlayerRegistrationPage,
    ForgotPasswordPage,
    ResetPasswordPage,
    DateTimePickerComponent,
    PreviewImageChatComponent,
    AssistenceComponent,
    AssistencesComponent,
    EventCreatedComponent,
    ImageViewPage,
    PlayerCloseEventPage,
    AddLocationUserFreeComponent,
    AgentFreePage,
    PlacesPlayerFreePage,
    EventTeamJoinPage,
    RequestsPlayerPage,
    RequestPlayerPage,
    CreateLeaguePage,
    SelectOwnerLeaguePage,
    AddTeamsLeagueComponent,
    CreateTeamManagerPage,
    TeamsLeaguePage,
    SelectLeaguesPage,
    RosterLeaguePage,
    SettingPage,
    RequestLeaguePage,
    RequestsLeaguePage,
    ChatFamilyPage,
    ImagesEventPage,
    UploadMultiplesImagesPage,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    { provide: HTTP_INTERCEPTORS, useClass: interceptor, multi: true },
    AuthServiceProvider,
    interceptor,
    Geolocation,
    HelpersProvider,
    Push,
    EmojiProvider,
    CameraPreview,
    Diagnostic,
    PhotoLibrary,
    DatePicker,
    WebSocketsProvider,
    InAppBrowser,
    Camera,
    WebIntent,
    EmojiProvider,
    Device,
    INotificationProvider,
    Globalization,
    BackgroundGeolocation,
    LocationAccuracy,
    File
  ]
})
export class AppModule {}

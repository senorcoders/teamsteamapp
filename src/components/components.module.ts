import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { CommentsComponent } from './comments/comments';
import { ViewTrakingComponent } from './view-traking/view-traking';
import { ViewLikesComponent } from './view-likes/view-likes';
import { SelectNewChatComponent } from './select-new-chat/select-new-chat';
import { TrackingEventComponent } from './tracking-event/tracking-event';
import { TrackingEventManagerComponent } from './tracking-event-manager/tracking-event-manager';
import { ToChatToPerfilPlayerComponent } from './to-chat-to-perfil-player/to-chat-to-perfil-player';
import { AsingpaymentComponent } from './asingpayment/asingpayment';
import { DateTimePickerComponent } from './date-time-picker/date-time-picker';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '../pipes/pipes.module';
import { PreviewImageChatComponent } from './preview-image-chat/preview-image-chat';
import { AssistenceComponent } from './assistence/assistence';
import { AssistencesComponent } from './assistences/assistences';
import { EventCreatedComponent } from './event-created/event-created';
import { SlideAssistencesEventComponent } from './slide-assistences-event/slide-assistences-event';
import { AddLocationUserFreeComponent } from './add-location-user-free/add-location-user-free';
import { AddTeamsLeagueComponent } from './add-teams-league/add-teams-league';
@NgModule({
	declarations: [
    CommentsComponent,
    ViewTrakingComponent,
    ViewLikesComponent,
    SelectNewChatComponent,
    TrackingEventComponent,
    TrackingEventManagerComponent,
    ToChatToPerfilPlayerComponent,
    AsingpaymentComponent,
    DateTimePickerComponent,
    PreviewImageChatComponent,
    AssistenceComponent,
    AssistencesComponent,
    EventCreatedComponent,
    SlideAssistencesEventComponent,
    AddLocationUserFreeComponent,
    AddTeamsLeagueComponent,
    ],
    imports: [ 
     IonicModule.forRoot(CommentsComponent),
     TranslateModule.forChild(),
      PipesModule
    ],
	exports: [
    CommentsComponent,
    ViewTrakingComponent,
    ViewLikesComponent,
    SelectNewChatComponent,
    TrackingEventComponent,
    TrackingEventManagerComponent,
    ToChatToPerfilPlayerComponent,
    AsingpaymentComponent,
    DateTimePickerComponent,
    TranslateModule,
    PreviewImageChatComponent,
    AssistenceComponent,
    AssistencesComponent,
    EventCreatedComponent,
    SlideAssistencesEventComponent,
    AddLocationUserFreeComponent,
    AddTeamsLeagueComponent,
    ]
})
export class ComponentsModule {}

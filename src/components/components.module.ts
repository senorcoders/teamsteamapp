import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { GoogleMapsComponent } from './google-maps/google-maps';
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
import { EmojiPickerComponent } from './emoji-picker/emoji-picker';
import { SlideAssistencesEventComponent } from './slide-assistences-event/slide-assistences-event';
@NgModule({
	declarations: [GoogleMapsComponent,
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
    EmojiPickerComponent,
    SlideAssistencesEventComponent
    ],
    imports: [ 
     IonicModule.forRoot(GoogleMapsComponent),
     TranslateModule.forChild(),
      PipesModule
    ],
	exports: [GoogleMapsComponent,
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
    EmojiPickerComponent,
    SlideAssistencesEventComponent
    ]
})
export class ComponentsModule {}

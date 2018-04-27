import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EmojiPickerComponent } from './emoji-picker/emoji-picker';
import { GoogleMapsComponent } from './google-maps/google-maps';
import { CommentsComponent } from './comments/comments';
import { ViewTrakingComponent } from './view-traking/view-traking';
import { ViewLikesComponent } from './view-likes/view-likes';
import { SelectNewChatComponent } from './select-new-chat/select-new-chat';
import { TrackingEventComponent } from './tracking-event/tracking-event';
import { TrackingEventManagerComponent } from './tracking-event-manager/tracking-event-manager';
import { ToChatToPerfilPlayerComponent } from './to-chat-to-perfil-player/to-chat-to-perfil-player';
import { AsingpaymentComponent } from './asingpayment/asingpayment';
@NgModule({
	declarations: [GoogleMapsComponent,
    CommentsComponent,
    ViewTrakingComponent,
    ViewLikesComponent,
    SelectNewChatComponent,
    TrackingEventComponent,
    TrackingEventManagerComponent,
    ToChatToPerfilPlayerComponent,
    AsingpaymentComponent/*EmojiPickerComponent*/],
	imports: [ /*IonicPageModule.forChild(EmojiPickerComponent),*/ ],
	exports: [GoogleMapsComponent,
    CommentsComponent,
    ViewTrakingComponent,
    ViewLikesComponent,
    SelectNewChatComponent,
    TrackingEventComponent,
    TrackingEventManagerComponent,
    ToChatToPerfilPlayerComponent,
    AsingpaymentComponent/*EmojiPickerComponent*/]
})
export class ComponentsModule {}

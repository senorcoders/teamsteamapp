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
@NgModule({
	declarations: [GoogleMapsComponent,
    CommentsComponent,
    ViewTrakingComponent,
    ViewLikesComponent,
    SelectNewChatComponent,
    TrackingEventComponent,
    TrackingEventManagerComponent/*EmojiPickerComponent*/],
	imports: [ /*IonicPageModule.forChild(EmojiPickerComponent),*/ ],
	exports: [GoogleMapsComponent,
    CommentsComponent,
    ViewTrakingComponent,
    ViewLikesComponent,
    SelectNewChatComponent,
    TrackingEventComponent,
    TrackingEventManagerComponent/*EmojiPickerComponent*/]
})
export class ComponentsModule {}

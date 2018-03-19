import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EmojiPickerComponent } from './emoji-picker/emoji-picker';
import { GoogleMapsComponent } from './google-maps/google-maps';
import { CommentsComponent } from './comments/comments';
import { ViewTrakingComponent } from './view-traking/view-traking';
import { ViewLikesComponent } from './view-likes/view-likes';
@NgModule({
	declarations: [GoogleMapsComponent,
    CommentsComponent,
    ViewTrakingComponent,
    ViewLikesComponent/*EmojiPickerComponent*/],
	imports: [ /*IonicPageModule.forChild(EmojiPickerComponent),*/ ],
	exports: [GoogleMapsComponent,
    CommentsComponent,
    ViewTrakingComponent,
    ViewLikesComponent/*EmojiPickerComponent*/]
})
export class ComponentsModule {}

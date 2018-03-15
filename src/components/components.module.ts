import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EmojiPickerComponent } from './emoji-picker/emoji-picker';
import { GoogleMapsComponent } from './google-maps/google-maps';
@NgModule({
	declarations: [GoogleMapsComponent/*EmojiPickerComponent*/],
	imports: [ /*IonicPageModule.forChild(EmojiPickerComponent),*/ ],
	exports: [GoogleMapsComponent/*EmojiPickerComponent*/]
})
export class ComponentsModule {}

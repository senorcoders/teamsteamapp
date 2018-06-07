import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditEventPage } from './edit-event';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    EditEventPage,
  ],
  imports: [
    IonicPageModule.forChild(EditEventPage),
    TranslateModule.forChild()
  ],
})
export class EditEventPageModule {}

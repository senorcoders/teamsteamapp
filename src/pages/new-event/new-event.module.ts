import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NewEventPage } from './new-event';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    NewEventPage,
  ],
  imports: [
    IonicPageModule.forChild(NewEventPage),
    TranslateModule.forChild()
  ],
})
export class NewEventPageModule {}

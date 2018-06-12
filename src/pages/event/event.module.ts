import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EventPage } from './event';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    EventPage,
  ],
  imports: [
    IonicPageModule.forChild(EventPage),
    TranslateModule.forChild()
  ],
})
export class EventPageModule {}

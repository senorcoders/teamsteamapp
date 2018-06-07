import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EventsSchedulePage } from './events-schedule';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    EventsSchedulePage,
  ],
  imports: [
    IonicPageModule.forChild(EventsSchedulePage),
    TranslateModule.forChild()
  ],
})
export class EventsSchedulePageModule {}

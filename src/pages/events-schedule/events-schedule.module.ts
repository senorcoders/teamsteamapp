import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EventsSchedulePage } from './events-schedule';

@NgModule({
  declarations: [
    //EventsSchedulePage,
  ],
  imports: [
    IonicPageModule.forChild(EventsSchedulePage)
  ],
})
export class EventsSchedulePageModule {}

import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EventsSchedulePage } from './events-schedule';
import { IonicImageLoader } from 'ionic-image-loader';

@NgModule({
  declarations: [
    //EventsSchedulePage,
  ],
  imports: [
    IonicPageModule.forChild(EventsSchedulePage),
    IonicImageLoader
  ],
})
export class EventsSchedulePageModule {}

import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TaskPage } from './task';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    TaskPage,
  ],
  imports: [
    IonicPageModule.forChild(TaskPage),
    TranslateModule.forChild()
  ],
})
export class TaskPageModule {}

import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NewTaskPage } from './new-task';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    NewTaskPage,
  ],
  imports: [
    IonicPageModule.forChild(NewTaskPage),
    TranslateModule.forChild()
  ],
})
export class NewTaskPageModule {}

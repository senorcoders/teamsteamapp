import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MyTaskPage } from './my-task';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    MyTaskPage,
  ],
  imports: [
    IonicPageModule.forChild(MyTaskPage),
    TranslateModule.forChild()
  ],
})
export class MyTaskPageModule {}

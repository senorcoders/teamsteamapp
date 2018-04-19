import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FormRequestPage } from './form-request';

@NgModule({
  declarations: [
    FormRequestPage,
  ],
  imports: [
    IonicPageModule.forChild(FormRequestPage),
  ],
})
export class FormRequestPageModule {}

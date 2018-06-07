import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FormPlayerRegistrationPage } from './form-player-registration';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    FormPlayerRegistrationPage,
  ],
  imports: [
    IonicPageModule.forChild(FormPlayerRegistrationPage),
    TranslateModule.forChild()
  ],
})
export class FormPlayerRegistrationPageModule {}

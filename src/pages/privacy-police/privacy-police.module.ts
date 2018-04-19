import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PrivacyPolicePage } from './privacy-police';

@NgModule({
  declarations: [
    PrivacyPolicePage,
  ],
  imports: [
    IonicPageModule.forChild(PrivacyPolicePage),
  ],
})
export class PrivacyPolicePageModule {}

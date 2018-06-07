import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PrivacyPolicePage } from './privacy-police';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    PrivacyPolicePage,
  ],
  imports: [
    IonicPageModule.forChild(PrivacyPolicePage),
    TranslateModule.forChild()
  ],
})
export class PrivacyPolicePageModule {}

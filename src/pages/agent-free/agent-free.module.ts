import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AgentFreePage } from './agent-free';

@NgModule({
  declarations: [
    AgentFreePage,
  ],
  imports: [
    IonicPageModule.forChild(AgentFreePage),
  ],
})
export class AgentFreePageModule {}

import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';

@Component({
  selector: 'image-view-event',
  templateUrl: 'image-view-event.html'
})
export class ImageViewEventComponent {

  public image:any={};

  constructor(public navParams:NavParams, public viewCtrl:ViewController) {
    this.image = this.navParams.get("image");
  }

}

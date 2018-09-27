import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

@Component({
  selector: 'preview-image-chat',
  templateUrl: 'preview-image-chat.html'
})
export class PreviewImageChatComponent {

  public static __name = "PreviewImageChatComponent"

  public image="";
  public comment="";

  constructor(public viewCtrl: ViewController, public navParams: NavParams) {
    this.image = this.navParams.get("image");
  }

  public async sendImg(){
    await this.viewCtrl.dismiss({comment: this.comment, image: this.image});
  }

}

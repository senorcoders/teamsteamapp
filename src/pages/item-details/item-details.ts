import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { NavParams } from 'ionic-angular';

import { LibraryItem } from '@ionic-native/photo-library';

@Component({
  selector: 'page-item-details',
  templateUrl: 'item-details.html'
})
export class ItemDetailsPage {

  selectedLibraryItem: LibraryItem;
  public resolve:Function;
  public reject:Function;

  public width:number;
  public height:number;

  constructor(public navCtrl: NavController, private navParams: NavParams) {

    this.selectedLibraryItem = navParams.get('libraryItem');

    this.resolve = this.navParams.get('resolve');
    this.reject = this.navParams.get('reject');

    this.width = this.navParams.get("width");
    this.height = this.navParams.get("height");

  }

  public async selectd(){
    var c = document.createElement('canvas');
    var ctx = c.getContext('2d');
    c.width = this.width;
    c.height = this.height;
    ctx.drawImage((document.getElementById('imageSelect') as any), 0,0, this.width, this.height);
    var dataURL = c.toDataURL('image/jpg');

    //console.log(this.selectedLibraryItem, dataURL, this.width, this.height);
    c=null;ctx=null;
    this.resolve(dataURL);
    await this.navCtrl.pop();
    await this.navCtrl.pop();
    await this.navCtrl.pop();
  }

  public cancel(){
    this.navCtrl.pop();
  }

}
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { NavParams } from 'ionic-angular';

import { LibraryItem } from '@ionic-native/photo-library';
import { HelpersProvider } from '../../providers/helpers/helpers';

/**
 * este component es para visualizar una imagen de la libreria de imagenes
 */
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
    let img = document.getElementById('imageSelect') as HTMLImageElement;
    c.width = img.width;
    c.height = img.height;
    ctx.drawImage(img, 0,0, img.width, img.height);
    var dataURL = c.toDataURL('image/jpg');
    console.log(img.width, img.height);

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
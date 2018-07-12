import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { LibraryItem } from '@ionic-native/photo-library';
import {DomSanitizationService} from '@angular/platform-browser';
import { AngularCropperjsComponent } from 'angular-cropperjs';

@IonicPage()
@Component({
  selector: 'page-image-view',
  templateUrl: 'image-view.html',
})
export class ImageViewPage {

  @ViewChild('angularCropper') public angularCropper: AngularCropperjsComponent;

  selectedLibraryItem: LibraryItem;
  public resolve: Function;
  public reject: Function;

  public width: number;
  public height: number;
  public degrees = 0;

  image: any = '';

  public resize = false;

  public cropperOptions = {
    dragMode: 'crop',
    aspectRatio: 2 / 2,
    autoCrop: true,
    movable: true,
    zoomable: false,
    scalable: false,
    autoCropArea: 0.8,
  };

  pop: number;

  constructor(public navCtrl: NavController, public navParams: NavParams, public domSanitizationService: DomSanitizationService) {

	console.log("Kharron was here");
    if (navParams.get('libraryItem') !== undefined) {
      this.selectedLibraryItem = navParams.get('libraryItem');
    } else {
      this.image = navParams.get("image");
    }

    this.resize = this.navParams.get("resize");
    this.resolve = this.navParams.get('resolve');
    this.reject = this.navParams.get('reject');
    this.width = this.navParams.get("width");
    this.height = this.navParams.get("height");
    this.pop = this.navParams.get("pop");
  }

  public addDegrees() {
    this.degrees += 90;
    console.log(this.degrees);
  }

  public drawRotated(context, canvas, image, degrees) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    // save the unrotated context of the canvas so we can restore it later
    // the alternative is to untranslate & unrotate after drawing
    context.save();

    // move to the center of the canvas
    context.translate(canvas.width / 2, canvas.height / 2);

    // rotate the canvas to the specified degrees
    context.rotate(degrees * Math.PI / 180);

    // draw the image
    // since the context is rotated, the image will be rotated also
    context.drawImage(image, -image.width / 2, -image.width / 2);

    // we’re done with the rotating so restore the unrotated context
    context.restore();
  }

  public async selectd() {
    var c = document.createElement('canvas');
    var ctx = c.getContext('2d');

    let img;
    if (this.resize === true) {
      //get cropped image
      let croppedImgB64String: string = this.angularCropper.cropper.getCroppedCanvas().toDataURL('image/jpeg', 0.8);
      img = new Image();
      img.src = croppedImgB64String;
      await new Promise(function (resolve, reject) {
        let trigger = false;

        img.onload = function () { resolve(); trigger = true; };
        setTimeout(function () {
          if (trigger === false)
            reject();
          this.reject("not load image cropped!");
        }.bind(this), 5000);
      }.bind(this));

    } else {
      img = document.getElementById("imageSelect") as HTMLImageElement;
    }

    c.width = this.width;
    c.height = this.height;
    ctx.drawImage(img, 0, 0, this.width, this.height);

    if (this.degrees !== 0)
      this.drawRotated(ctx, c, img, this.degrees);

    var dataURL = c.toDataURL('image/jpg');
    console.log(this.width, this.height);

    //console.log(this.selectedLibraryItem, dataURL, this.width, this.height);
    c = null; ctx = null;
    this.resolve(dataURL);
    if (this.pop === 3) {
      await this.navCtrl.pop();
      await this.navCtrl.pop();
      await this.navCtrl.pop();
    } else {
      await this.navCtrl.pop();
      await this.navCtrl.pop();
    }
  }

  public cancel() {
    this.navCtrl.pop();
  }


}

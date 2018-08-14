import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { LibraryItem } from '@ionic-native/photo-library';
import { DomSanitizer } from '@angular/platform-browser';
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

  private navigator = false;

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
    checkCrossOrigin: false
  };

  pop: number;

  constructor(public navCtrl: NavController, public navParams: NavParams, public domSanitizationService: DomSanitizer) {

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
    this.navigator = this.navParams.get("navigator");
  }

  public addDegrees() {
    this.degrees += 90;
    console.log(this.degrees);
  }

  async ngAfterViewInit() {
    console.log("load");
    if (this.resize === true) {
      await this.angularCropper.ready.subscribe(od => {
        console.log("ready", od)
      }, err => {
        console.error(err);
      })
      console.log("loaded");
    }
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
      let croppedImgB64String: String = this.getCropper();
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

    var dataURL = c.toDataURL('image/jpeg');
    console.log(this.width, this.height);

    //console.log(this.selectedLibraryItem, dataURL, this.width, this.height);
    c = null; ctx = null;
    this.resolve(dataURL);
    if (this.navigator === true) {
      await this.navCtrl.pop();
      return;
    }

    if (this.pop === 3) {
      await this.navCtrl.pop();
      await this.navCtrl.pop();
      await this.navCtrl.pop();
    } else {
      await this.navCtrl.pop();
      await this.navCtrl.pop();
    }
  }

  private getCropper(): String {
    let result: String;
    try {
      result = this.angularCropper.cropper.getCroppedCanvas().toDataURL('image/jpeg', 0.8);
    }
    catch (e) {
      console.error(e);

      //Si el plugin no funciona obtenemos las coordenas para
      //hacer el recortes en un canvas
      let node = document.querySelector(".cropper-crop-box") as any;
      let matrix = new WebKitCSSMatrix(window.getComputedStyle(node).webkitTransform);
      let left = node.offsetLeft + matrix.m41;
      let top = node.offsetTop + matrix.m42;
      let clientRect = node.getClientRects();
      let width = clientRect.item(0).width;
      let height = clientRect.item(0).height;

      //Creamos el canvas para cargar el image data
      let image = document.querySelector(".cropper-wrap-box>.cropper-canvas>img") as HTMLImageElement;
      var canvas1 = document.createElement("canvas");
      canvas1.width = image.width;
      canvas1.height = image.height;
      var ctx1 = canvas1.getContext("2d");
      ctx1.drawImage(image, 0, 0, image.width, image.height);
      let imageData = ctx1.getImageData(left, top, width, height);

      // //Y realizamos el recorte en otro canvas
      var canvas2 = document.createElement("canvas");
      canvas2.width = width;
      canvas2.height = height;
      var ctx2 = canvas2.getContext("2d");
      ctx2.rect(0, 0, width, height);
      ctx2.fillStyle = 'white';
      ctx2.fill();
      ctx2.putImageData(imageData, 0, 0);

      result = canvas2.toDataURL("image/jpg");
      canvas1 = null;
      canvas2 = null;
    }

    return result;
  }

  public cancel() {
    this.navCtrl.pop();
  }


}

import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController, Platform } from 'ionic-angular';
import { CameraPreview, CameraPreviewPictureOptions, CameraPreviewOptions, CameraPreviewDimensions } from '@ionic-native/camera-preview';
import { PhotoLibrary } from '@ionic-native/photo-library';
import { LibraryImagesPage } from '../library-images/library-images';
import { AndroidFullScreen } from '@ionic-native/android-full-screen';
import { Camera, CameraOptions } from '@ionic-native/camera';
declare var cordova: any; // global variable for paths

/**
 * este es una page donde poder visualizar correctamente la camera
 */
@IonicPage()
@Component({
  selector: 'page-camera',
  templateUrl: 'camera.html',
})
export class CameraPage {
  private picture: string;
  public resolve: Function;
  public reject: Function;

  private width: number;
  private height: number;
  private quality: number;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public toastCtrl: ToastController, public cameraPreview: CameraPreview,
    public photoLibrary: PhotoLibrary, private androidFullScreen: AndroidFullScreen,
    public loadCtrl: LoadingController, public camera: Camera,
    public platform: Platform
  ) {

    this.resolve = this.navParams.get("resolve");
    this.reject = this.navParams.get("reject");
    this.width = this.navParams.get("width");
    this.height = this.navParams.get("height");
    this.quality = this.navParams.get("quality");

  }

  moveFileToExternalStorage(fileName: string) {
    // Determine paths
    let externalStoragePath: string =
      cordova.file.externalApplicationStorageDirectory;
    let currentPath: string =
      cordova.file.applicationStorageDirectory + "files/";

    // Extract filename
    fileName = fileName.split("/").pop();


  }

  //Para tomar la foto
  takePicture() {
    const pictureOpts: CameraPreviewPictureOptions = {
      width: this.width,
      height: this.height,
      quality: this.quality
    }

    this.cameraPreview.takePicture(pictureOpts).then((imageData) => {
      this.picture = 'data:image/jpeg;base64,' + imageData;
      this.navCtrl.pop();
      this.resolve(this.picture)
      this.cameraPreview.stopCamera();
    }, (err) => {
      console.log(err);
      this.picture = null;
    });
  }

  changeEffect() {
    // Create an array with 5 effects
    let effects: any = ['none', 'negative', 'mono', 'aqua', 'sepia'];

    let randomEffect: string = effects[Math.floor(Math.random() * effects.length)];
    this.cameraPreview.setColorEffect(randomEffect);
  }

  //Para iniciar la camera cada ves que se entra a la page
  async ionViewDidLoad() {
    console.log("ionViewDidLoad " + Math.random());

    let previewOtions: CameraPreviewOptions = {
      x: 0,
      y: 56,
      width: window.screen.width,
      height: window.screen.height - 156,
      camera: 'rear',
      tapPhoto: false,
      previewDrag: false,
      toBack: false,
      alpha: 1,
      tapToFocus: true
    };

    try {
      await this.cameraPreview.startCamera(previewOtions);
    } catch (e) {
      console.error(e);
      await this.cameraPreview.show();
    }

    await this.cameraPreview.setFlashMode(this.cameraPreview.FLASH_MODE.AUTO);

  }

  //Para iniciar la camera cada ves que se entra a la page sin haberla cerrado
  async ionViewWillEnter() {
    console.log("ionViewWillEnter " + Math.random());
    let previewOtions: CameraPreviewOptions = {
      x: 0,
      y: 0,
      width: window.innerWidth,
      height: window.innerHeight - 80,
      camera: 'rear',
      tapPhoto: true,
      previewDrag: false,
      toBack: true,
      alpha: 1,
      tapToFocus: true
    };

    try {
      await this.cameraPreview.startCamera(previewOtions);
    } catch (e) {
      console.error(e);
      await this.cameraPreview.show();
    }
  }

  //para detener la camera cuando se cierra la pagina pop
  ionViewDidLeave() {
    this.cameraPreview.stopCamera();
    console.log("ionViewDidLeave " + Math.random());
  }

  //para detener la camera cuando se oculta la pagina push
  ionViewWillUnload() {
    console.log("ionViewWillUnload " + Math.random());
    this.resolve();
  }

  public toBack() {
    this.cameraPreview.stopCamera();
    this.navCtrl.pop();
  }

  //mostrar la libraria de fotos
  public async toLibrary() {

    if ( this.platform.is("ios") ) {
      let options: CameraOptions = {
        quality: this.quality,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
        sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
      };
      this.camera.getPicture(options).then(async function (imageData) {
        // imageData is either a base64 encoded string or a file URI
        // If it's base64:
        this.resolve('data:image/jpeg;base64,' + imageData);
        await this.navCtrl.pop();
      }.bind(this), function (err) {
        console.error(err);
      }.bind(this));

    } else {
      this.cameraPreview.hide();
      this.navCtrl.push(LibraryImagesPage, {
        resolve: this.resolve, reject: this.reject,
        width: this.width, height: this.height
      });
    }

  }

  //Para cambiar a alternativa camera
  public switchCamera() {
    this.cameraPreview.switchCamera();
  }

  //esto no trabaja quizas lo elimine en el futuro nesesito probar con otros telefonos
  public async switchFlash() {
    let flash = await this.cameraPreview.getFlashMode();
    console.log(flash);
    if (flash == this.cameraPreview.FLASH_MODE.OFF) {
      await this.cameraPreview.setFlashMode(this.cameraPreview.FLASH_MODE.ON);
    } else {
      await this.cameraPreview.setFlashMode(this.cameraPreview.FLASH_MODE.OFF);
    }
    flash = await this.cameraPreview.getFlashMode();
    console.log(flash);
  }
}

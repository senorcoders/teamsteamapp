import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { CameraPreview, CameraPreviewPictureOptions, CameraPreviewOptions, CameraPreviewDimensions } from '@ionic-native/camera-preview';
import { File } from '@ionic-native/file';
import { PhotoLibrary } from '@ionic-native/photo-library';
import { LibraryImagesPage } from '../library-images/library-images';
import { AndroidFullScreen } from '@ionic-native/android-full-screen';
declare var cordova: any; // global variable for paths

/**
 * Generated class for the CameraPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-camera',
  templateUrl: 'camera.html',
})
export class CameraPage {
  private picture:string;
  public resolve:Function;
  public reject:Function;

  private width:number;
  private height:number;
  private quality:number;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public toastCtrl: ToastController, public cameraPreview: CameraPreview,
    public file: File, public photoLibrary: PhotoLibrary,
    private androidFullScreen: AndroidFullScreen
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

    // Move the file
    this.file.moveFile(currentPath, fileName,
                  externalStoragePath, fileName).then(_ => {
        this.toastCtrl.create(
            {
                message: "Saved one photo", 
                position: "bottom",
                duration: 2000
            }
        ).present();
    });
  }

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
    let effects: any = ['none', 'negative','mono', 'aqua', 'sepia'];

    let randomEffect: string = effects[Math.floor(Math.random() * effects.length)];
    this.cameraPreview.setColorEffect(randomEffect);
  }

  async ionViewDidLoad(){
    console.log("ionViewDidLoad "+ Math.random());

    let previewOtions: CameraPreviewOptions = {
      x: 0,
      y: 0,
      width: window.innerWidth,
      height: window.innerHeight - 80,
      camera: 'rear',
      tapPhoto: false,
      previewDrag: false,
      toBack: false,
      alpha: 1,
      tapToFocus: true
    };

    try{
      await this.cameraPreview.startCamera(previewOtions);
    }catch(e){
      console.error(e);
      await this.cameraPreview.show();
    }

    await this.cameraPreview.setFlashMode(this.cameraPreview.FLASH_MODE.AUTO);

  }

  async ionViewWillEnter(){
    console.log("ionViewWillEnter "+ Math.random());
    let previewOtions: CameraPreviewOptions = {
      x: 0,
      y: 0,
      width: window.innerWidth,
      height: window.innerHeight - 80,
      camera: 'rear',
      tapPhoto: false,
      previewDrag: false,
      toBack: false,
      alpha: 1,
      tapToFocus: true
    };

    try{
      await this.cameraPreview.startCamera(previewOtions);
    }catch(e){
      console.error(e);
      await this.cameraPreview.show();
    }
  }
  
  ionViewDidLeave(){
    this.cameraPreview.stopCamera();
    console.log("ionViewDidLeave "+ Math.random());
  }

  ionViewWillUnload(){
    console.log("ionViewWillUnload "+ Math.random());
    this.reject({ message: "cancel" });
  }

  public toBack(){
    this.cameraPreview.stopCamera();
    this.navCtrl.pop();
  }

  public async toLibrary(){
    this.cameraPreview.hide();
    this.navCtrl.push(LibraryImagesPage, { resolve: this.resolve, reject: this.reject, 
      width: this.width, height : this.height });
  }

  public switchCamera(){
    this.cameraPreview.switchCamera();
  }

  public async switchFlash(){
    let flash = await this.cameraPreview.getFlashMode();
    console.log(flash);
    if( flash == this.cameraPreview.FLASH_MODE.OFF ){
      await this.cameraPreview.setFlashMode(this.cameraPreview.FLASH_MODE.ON);
    }else{
      await this.cameraPreview.setFlashMode(this.cameraPreview.FLASH_MODE.OFF);
    }
    flash = await this.cameraPreview.getFlashMode();
    console.log(flash);
  }
}

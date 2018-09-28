import { Component } from '@angular/core';
import { Platform, ToastController, NavController } from 'ionic-angular';

import { PhotoLibrary } from '@ionic-native/photo-library';

/**
 * para pedir permiso para acceder a la library de photos del telefono
 */

@Component({
  selector: 'page-permissions',
  templateUrl: 'permissions.html'
})
export class PermissionsPage {

  public static __name = "PermissionsPage"


  constructor(public navCtrl: NavController,
    private photoLibrary: PhotoLibrary, private platform: Platform, private toastCtrl: ToastController) {
  }

  tryRequestAuthorization() {

    this.platform.ready().then(() => {
      this.photoLibrary.requestAuthorization({read: true})
        .then(() => {
          this.navCtrl.pop();
        })
        .catch((err) => {
          let toast = this.toastCtrl.create({
            message: `requestAuthorization error: ${err}`,
            duration: 6000,
          });
          toast.present();
        });
    });

  }

}
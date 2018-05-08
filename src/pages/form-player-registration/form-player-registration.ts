import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { HelpersProvider } from '../../providers/helpers/helpers';

@IonicPage()
@Component({
  selector: 'page-form-player-registration',
  templateUrl: 'form-player-registration.html',
})
export class FormPlayerRegistrationPage {

  public form:any={ fields : [] };

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private http: HttpClient, private helper: HelpersProvider,
    public alertCtrl: AlertController
  ) {

  }

  async ionViewDidEnter(){

    let load = this.helper.getLoadingStandar();

    this.form = await this.http.get("/registrationtemplate/5af0d02d704b2d118f38fb58").toPromise();
    
    load.dismiss();

  }

  public async save(){
    
    let valid = true;
    for(let field of this.form.fields){

      if( field.required === true ){

        if( !field.hasOwnProperty("value") || field.value.toString() === "" ){
          let emptyM = await this.helper.getWords("ISREQUIRED");
          this.alertCtrl.create({
            title: "Error",
            message: field.label+ " "+ emptyM,
            buttons: ["Ok"]
          })
          .present();
          valid = false;
          break;
        }
      }

    }

    if( valid === false ) return;

  }

  public agregar(){
    this.form.fields.push({
      label: "Telefono",
      type: "tel"
    });
  }

}
 
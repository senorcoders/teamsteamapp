import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, Loading } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { MyTaskPage } from '../my-task/my-task';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { MyApp } from '../../app/app.component';
import * as moment from 'moment';

/**
 * para ver la tarea
 */

@IonicPage()
@Component({
  selector: 'page-task',
  templateUrl: 'task.html',
})
export class TaskPage {
  
  public task:any;
  public load:Loading;
  public manager:boolean=false;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient, public alertCtrl: AlertController, 
    public auth: AuthServiceProvider, public loading: LoadingController
      ) {
    this.task = this.navParams.get("task");
    this.task.dateParsed = moment(this.task.dateTime).format('ddd DD MMM YYYY hh:mm a');
    this.manager = MyApp.User.role.name === "Manager";
  }

  //pedir la contraseña para comprobar si el usuario es el legitimo
  public requestRemove(){
    let t = this;
    let alert = this.alertCtrl.create({
      title: 'Confirm Password',
      inputs: [
        {
          name: 'password',
          placeholder: 'Password',
          type: 'password'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Go!',
          handler: data => {
            t.checkPassword(data.password);
          }
        }
      ]
    });
    alert.present();
  }

  //comprobar si la contraseña es correcta
  public checkPassword(password){
    let email = this.auth.User().email;

    this.load = this.loading.create({ content: "Deleting..." });
    this.load.present({ disableApp : true });
    let t = this;
    this.http.post('/login', { email, password})
    .subscribe(function(data:any){

      if( data.hasOwnProperty("message") && data.message == "User not found" ){
        t.load.dismiss();
        t.alertCtrl.create({
          title: "Error",
          message: "Passwords do not match",
          buttons: ["Ok"]
        }).present();

      }else{

        console.log("success");
        t.removeTask();

      }
    }, function(err){
      
      this.load.dismiss();

      t.alertCtrl.create({
        title: "Error",
        message: "Unexpected Error",
        buttons: ["Ok"]
      }).present();

      console.error(err);

    });
  }

  //Para eliminar tareas
  public async removeTask(){
    
    let valid = true;

    try{
      let t = this.http.delete("/task/"+ this.task.id).toPromise();
      console.log(t);
      this.load.dismiss();
    }
    catch(e){
      console.error(e);
      valid=false;
      this.load.dismiss();
    }

    if( valid ) this.navCtrl.setRoot(MyTaskPage);
  }
  
  //Para cambiar de completada a no completada y viceversa
  public async changeStatus(){
    let task = this.task;
    task.completad = !this.task.completad;
    task.team = Object.prototype.toString.call(this.task.team) === '[object String]'  ? this.task.team : this.task.team.id;
    let valid = true;

    try{
      let ta = await this.http.put('/task/'+ this.task.id, task).toPromise();
      console.log(ta);
    }
    catch(e){
      console.error(e);
      valid = false;
    }

    if( valid ) this.task.completad = task.completad;
    
  }

}

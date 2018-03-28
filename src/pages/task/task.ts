import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, Loading } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { MyTaskPage } from '../my-task/my-task';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { MyApp } from '../../app/app.component';

/**
 * Generated class for the TaskPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
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
    this.manager = MyApp.User.role.name === "Manager";
  }

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

  public checkPassword(password){
    let username = this.auth.User().username;

    this.load = this.loading.create({ content: "Deleting..." });
    this.load.present({ disableApp : true });
    let t = this;
    this.http.post('/login', { username, password})
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

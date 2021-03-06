import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, Loading } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { MyApp } from '../../app/app.component';
import * as moment from 'moment';
import { HelpersProvider } from '../../providers/helpers/helpers';

/**
 * para ver la tarea
 */

@IonicPage()
@Component({
  selector: 'page-task',
  templateUrl: 'task.html',
})
export class TaskPage {

  public static __name = "TaskPage"


  public task: any;
  public load: Loading;
  public manager: boolean = false;
  public user = MyApp.User;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient, public alertCtrl: AlertController,
    public auth: AuthServiceProvider, public loading: LoadingController
  ) {
    this.task = this.navParams.get("task");
    this.task.dateParsed = moment(this.task.dateTime).format('ddd DD MMM YYYY hh:mm a');
    this.manager = MyApp.User.role.name === "Manager";
  }

  //pedir la contraseña para comprobar si el usuario es el legitimo
  public requestRemove() {
    HelpersProvider.me.presentAlertStandar(this.removeTask.bind(this));
  }

  //Para eliminar tareas
  public async removeTask() {

    let valid = true;
    this.load = HelpersProvider.me.getLoadingStandar();
    try {
      let t = await this.http.delete("/task/" + this.task.id).toPromise();
      console.log(t);
      this.load.dismiss();
    }
    catch (e) {
      console.error(e);
      valid = false;
      this.load.dismiss();
    }

    if (valid) this.navCtrl.pop();
  }

  //Para cambiar de completada a no completada y viceversa
  public async changeStatus() {
    let completad = !this.task.completad;
    //task.team = Object.prototype.toString.call(this.task.team) === '[object String]'  ? this.task.team : this.task.team.id;
    let valid = true;

    try {
      let ta = await this.http.put('/task/' + this.task.id, { completad }).toPromise();
      console.log(ta);
    }
    catch (e) {
      console.error(e);
      valid = false;
    }

    if (valid) this.task.completad = completad;

  }

}

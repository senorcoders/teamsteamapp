import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { NewTaskPage } from '../new-task/new-task';
import { HttpClient } from '@angular/common/http';
import { MyApp } from '../../app/app.component';
import { TaskPage } from '../task/task';
import  * as moment from 'moment';

/**
 * para visualizar todas las tareas asignadas al equipo
 */

@IonicPage()
@Component({
  selector: 'page-my-task',
  templateUrl: 'my-task.html',
})
export class MyTaskPage {

  public tasks:Array<any>=[];
  public role = "";

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private http: HttpClient
  ) {
    this.role = MyApp.User.role.name;
  }

  async ngOnInit(){
    await this.getTasks();
  }

  async getTasks(){

    console.log(MyApp.User);
    let tasks:any;
    if( MyApp.User.role.name === "Manager" ){
      tasks = await this.http.get('/task/from/'+ MyApp.User.id+ "/"+ MyApp.User.team).toPromise();
    }else{
      tasks = await this.http.get('/task/for/'+ MyApp.User.id+ "/"+ MyApp.User.team).toPromise();
    }
    
    let now = moment();
    this.tasks = await Promise.all((tasks.map(async (item)=>{
      item.past = moment(item.dateTime).isBefore(now);
      item.dateParsed = moment(item.dateTime).format('ddd DD MMM YYYY HH:mm');
      return item;
    })));

    this.tasks = this.tasks.sort(function(a, b){

      let d1 = moment(a.dateTime), d2 = moment(b.dateTime);
      
      if (d1.isBefore(d2)) {            // a comes first
        return -1
      } else if (d1.isAfter(d2)) {     // b comes first
          return 1
      } else {                // equal, so order is irrelevant
          return 0
      }            // note: sort is not necessarily stable in JS

    });
    console.log(this.tasks);
  }

  public newTask(){
    this.navCtrl.push(NewTaskPage);
  }

  public viewTask(task){
    this.navCtrl.push(TaskPage, {
      task
    });
  }

  public by(i:number){
    return i;
  }

}

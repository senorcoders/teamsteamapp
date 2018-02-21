import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { MenuController } from 'ionic-angular';

/*
  Generated class for the AuthServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/

//#region Class of User
class User {
  public id:String;
  public username:String;
  public email:String;
  public firstName:string;
  public lastName:String;
  public role:Object={
    name:""
  };

}

@Injectable()
export class AuthServiceProvider {

  private user:User= new User();

  constructor(public http: HttpClient, public storage: Storage, public menuCtrl: MenuController) {

  }

  /**
   * Login
   */
  public Login(username:String, password:String, callback:Function) {
    var t = this;
    this.http.post('/login', { username, password})
    .subscribe(function(data:any){
      if( data.hasOwnProperty("message") && data.message == "User not found" ){
        callback(data, null);
      }else{
        callback(null, data);
        
        t.menuCtrl.swipeEnable(true);

        //For save
        t.storage.set('user', data);
        t.user = new User();
        t.user.id = data.id;
        t.user.username = data.username;
        t.user.firstName = data.firstName;
        t.user.lastName = data.lastName;
        t.user.email = data.email;
        t.user.role = data.role;

      }
    }, function(err){
      console.log(err);
      callback(null, null);
    });
    
  }

  public async checkUser(){
    var user = await this.storage.get("user");
    this.user = user;
    if(user != null){
      this.menuCtrl.swipeEnable(true);
      return true;
    }

    this.menuCtrl.swipeEnable(false);
    return false;
  }

  public User(){
    return this.user;
  }

  public fullName(){
    return this.user.firstName+ " "+ this.user.lastName;
  }

  public async logout(){
    this.user = null;
    this.menuCtrl.swipeEnable(false);
    var data = await this.storage.remove("user");
    return data === undefined;
  }

}

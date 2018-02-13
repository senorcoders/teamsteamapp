import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

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

  constructor(public http: HttpClient, public storage: Storage) {
    
  }

  /**
   * Login
   */
  public Login(username:String, password:String, callback:Function) {
    var t = this;
    this.http.post('/login', { username, password})
    .subscribe(function(data:any){
      if( data.hasOwnProperty("message") && data.message == "User not found" ){
        callback(null, null);
      }else{
        callback(null, data);
        
        //For save
        t.storage.set('user', data);

      }
    })
    
  }

  public checkUser(){
    /*t.user.id = data.id;
        t.user.username = data.username;
        t.user.firstName = data.firstName;
        t.user.lastName = data.lastName;
        t.user.email = data.email;*/
  }

  public fullName(){
    return this.user.firstName+ " "+ this.user.lastName;
  }

}

import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { Storage } from '@ionic/storage';
import { MenuController } from 'ionic-angular';
import { MyApp } from '../../app/app.component';

/**
 * Para manejar la session del usuario y guardar datos importantes
 */

//#region Class of User
class User {
  public id:String;
  public username:String;
  public email:String;
  public firstName:string;
  public lastName:String;
  public team:string;
  public token:string;
  public role:Object={
    name:""
  };

}

@Injectable()
export class AuthServiceProvider {

  private user:User= new User();
  public functions:any=function(){};

  constructor(public http: HttpClient, public storage: Storage, public menuCtrl: MenuController,
  public zone: NgZone ) {

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
        t.user.token = data.token;

        t.SaveTeam(function(){
          callback(null, data);
        });
      }
    }, function(err){
      console.log(err);
      callback(null, null);
    });
    
  }
  
  //guardar el team del usuario para evitar estar cargando del servidor el equipo
  public async SaveTeam(callback:Function){
    let user;

    try{
      user = this.User();
      MyApp.User = user;
      
      let url;
      if( user.role.name === "Player"){
        url = "/team/player/"+ user.id;
      }else if( user.role.name === "Manager" ){
        url = "/team/manager/"+ user.id;
      }else if( user.role.name === "Family" ){
        url = "/team/family/"+ user.id;
      }
      
      var res = await this.http.get(url).toPromise();

      let team:any = res;

      let events:any;

      if( team.hasOwnProperty('team') ){
        team = team.team;
      }else if( Object.prototype.toString.call(team) === '[object Array]'){
        team = team[0].team;
      }

      console.log("team "+ team);
      this.user.team = team;
      MyApp.User = this.user;
      this.storage.set("team", team);
      this.changesUpdate();
      callback();
    }catch(e){
      console.error(e);
      callback();
    }

  }

  public async updateTokenReg(token){
    console.log(token);
    let updated = await this.http.put("/user/"+ MyApp.User.id, { "tokenReg": token }).toPromise()
    console.log(updated);
  }

  //comprobar si ya un usuario guardado
  public async checkUser(){
    let user = await this.storage.get("user");
    let team = await this.storage.get("team");

    this.user = user;
    if(user != null){
      this.user.team = team;
      this.menuCtrl.swipeEnable(true);
      return true;
    }

    this.menuCtrl.swipeEnable(false);
    return false;
  }

  //de volver la instancia del usuario actual
  public User(){
    return this.user;
  }

  //Obtener el nombre completo del usuario
  public fullName(){
    return this.user.firstName+ " "+ this.user.lastName;
  }

  public async logout(){
    this.user = null;
    this.menuCtrl.swipeEnable(false);
    var data = await this.storage.remove("user");
    data = await this.storage.remove("team");
    return data === undefined;
  }

  private changesUpdate(){
    this.functions();
  }

  //esto es para actualizar datos en el app para cuando se cambie de usuario
  public changeUser(callback:any){
    this.functions = callback;
  }

}

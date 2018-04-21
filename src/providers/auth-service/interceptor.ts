import { Injectable, NgModule} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest} from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthServiceProvider } from './auth-service';
import { MyApp } from '../../app/app.component';

/**
 * intercepta todos lo peticiones que se realizan por http cliente para añadir 
 * la base url y token de seguridad
 */

@Injectable()
export class interceptor implements HttpInterceptor {

  public static url:string = 'http://138.68.19.227:8187'; // 'http://192.168.1.2:8187'; 'http://localhost:8087';
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if( req.url.includes("./assets/i18n/") ) return next.handle(req);

    if( MyApp.hasOwnProperty('User') && MyApp.User.hasOwnProperty('token') ){

      let token = MyApp.User.token;
      if( token !== undefined && token !== undefined){

        req = req.clone({
          url : interceptor.url+ req.url,
          setHeaders: {
            'token': token
          }
        });

      }

    }else{
      req = req.clone({
        url: interceptor.url + req.url
      });
    }
  
    return next.handle(req);
  }

  //agrega el token de seguridad a los url, es para aquellos que no se les puede asingar header
  //como el src de una imagen
  public static transformUrl(url):string{

    if( MyApp.hasOwnProperty('User') && MyApp.User.hasOwnProperty('token') ){
      url += '?token='+ MyApp.User.token;
    }

    return interceptor.url+ url;
  }
  
}
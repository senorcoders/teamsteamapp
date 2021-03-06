import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest} from '@angular/common/http';
import { MyApp } from '../../app/app.component';
import { HelpersProvider } from '../helpers/helpers';

/**
 * intercepta todas lo peticiones que se realizan por http cliente para añadir
 * la base url y token de seguridad
 */

@Injectable()
export class interceptor implements HttpInterceptor {

  public static url = 'https://api.lockerroomapp.com'; // "http://localhost:8187";

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if( req.url.includes("./assets/i18n/") ) return next.handle(req);
    if( req.url.includes("maps.googleapis.com") ) return next.handle(req);
    if( req.url.includes("/data/2.5/forecast") ) {
      let url = "https://api.openweathermap.org";
      req = req.clone({
        url: url + req.url+ `&APPID=${HelpersProvider.me.wheaterApiKey}`
      });

      return next.handle(req);
    }

    if( MyApp.hasOwnProperty('User') && MyApp.User.hasOwnProperty('token') ){

      let token = MyApp.User.token;
      if( token !== undefined && token !== null){

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


import { catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable, of, throwError } from 'rxjs';
import { Router } from '@angular/router';


@Injectable()

export class AuthInterceptor implements HttpInterceptor {

  Headers = new Headers();
  constructor(private authService: AuthService,private router: Router) {

  }
  private handleAuthError(err: HttpErrorResponse): Observable<any> {
    //handle your auth error or rethrow
    if (err.status === 401 || err.status === 403) {
        //navigate /delete cookies or whatever
        this.router.navigateByUrl(`/log-in`);
        return of(err.message); // or EMPTY may be appropriate here
    }
    return throwError(err);
  }
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    let headers = new HttpHeaders();
    this.authService.token.subscribe(token =>  {
      let accessId='Bearer '+ token
      headers = headers.set('Authorization', accessId);
    })


    const authReq = req.clone({headers});
    console.log('Intercepted HTTP call', authReq);

    return next.handle(authReq).pipe(catchError(x=> this.handleAuthError(x)));
  }
}

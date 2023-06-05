import { Injectable } from '@angular/core';
import { User } from './user';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})

export class AuthService {
  headers = new HttpHeaders();
  endpoint: string = 'http://localhost:4000/api';
  currentUser = {};
  public token: BehaviorSubject<any> = new BehaviorSubject('');
  constructor(private http: HttpClient, public router: Router) {
    let headers = new HttpHeaders();
    this.headers = headers
    let auth =JSON.parse(localStorage.getItem('access_token') || '{}');
    headers = headers.set('Content-Type', 'application/json');
    // headers = headers.set('Authorization', 'Bearer ' + auth);
    this.getUserId();
    // this.getUserInf();
  }

  // Sign-up
  signUp(user: User): Observable<any> {
    let api = `${this.endpoint}/register-user`;
    return this.http.post(api, user).pipe(catchError(this.handleError));
  }

  // Sign-in
  signIn(user: User) {
    return this.http
      .post<any>(`${this.endpoint}/signin`, user)
      .subscribe((res: any) => {
        console.log(res);
        localStorage.setItem('access_token',  JSON.stringify(res.token));
        localStorage.setItem('user_id', JSON.stringify(res._id));
        let access_token= JSON.parse(localStorage.getItem('access_token') || '{}');
        this.token.next(access_token);
        this.router.navigate(['/home']);
      });
  }

  getUserInf() {
    console.log('getUser',this.getUserId())
    this.getUserProfile(this.getUserId()).subscribe((res) => {
      this.currentUser = res;
      console.log('getprofile',res);
      this.router.navigate(['user-profile/' + res.msg._id]);
    });
  }

  getUserId() {
    let user= JSON.parse(localStorage.getItem('user_id') || '{}');
    console.log(user);
    return user
  }

  get isLoggedIn(): boolean {
    let authToken = localStorage.getItem('access_token');
    return authToken !== null ? true : false;
  }

  doLogout() {
    let removeToken = localStorage.removeItem('access_token');
    if (removeToken == null) {
      this.router.navigate(['log-in']);
    }
  }

  // User profile
  getUserProfile(id: any): Observable<any> {
    let api = `${this.endpoint}/user-profile/${id}`;
    return this.http.get(api, { headers: this.headers }).pipe(
      map((res) => {
        return res || {};
      }),
      catchError(this.handleError)
    );
  }

  // Error
  handleError(error: HttpErrorResponse) {
    let msg = '';
    if (error.error instanceof ErrorEvent) {
      // client-side error
      msg = error.error.message;
    } else {
      // server-side error
      msg = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(msg);
  }
}

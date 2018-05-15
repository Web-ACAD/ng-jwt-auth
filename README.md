[![NPM version](https://img.shields.io/npm/v/@webacad/ng-jwt-auth.svg?style=flat-square)](https://www.npmjs.com/package/@webacad/ng-jwt-auth)
[![Build Status](https://img.shields.io/travis/Web-ACAD/ng-jwt-auth.svg?style=flat-square)](https://travis-ci.org/Web-ACAD/ng-jwt-auth)

# WebACAD/NgJwtAuth

JWT authentication for angular.

## Includes

* Authorization service
* HTTP interceptor
* Basic logged in router guard
* Auto login on page refresh (uses [store](https://github.com/marcuswestin/store.js) to store the token in browser)

## Installation

**Dependencies:**

* @angular/core
* @angular/common
* @angular/router
* @webacad/ng-store
* jwt-decode
* rxjs@^5.5.0

Install with npm:

```bash
npm install --save @webacad/ng-jwt-auth
```

or with yarn:

```bash
yarn add @webacad/ng-jwt-auth
```

## Configuration

First create a new class which will extend the `AbstractAuthConfigurator`. This new class will be used as a bridge
between your application and this library.

```typescript
import {Injectable} from '@angular/core';
import {HttpResponse, HttpErrorResponse} from '@angular/common/http';
import {AbstractAuthConfigurator} from '@webacad/ng-jwt-auth';
import {Observable} from 'rxjs/Observable';

import {UsersRepository, User} from '../model/users';

@Injectable()
export class AuthConfigurator extends AbstractAuthConfigurator<User>
{

    constructor(
        private $users: UsersRepository,
    ) {
        super({
            withCredentials: true,
            loginPage: '/login',
            tokenStorage: 'sm_jwt_data',
        });
    }

    public isServerLogout(err: HttpErrorResponse): boolean
    {
        return err.status === 403;
    }

    public extractToken(response: HttpResponse<any>): string|undefined
    {
        return response.body.auth.token;
    }

    public getUserByToken(token: any): Observable<User>
    {
        return this.$users.get(token.jti);
    }

    public login(data: any): Observable<User>
    {
        return this.$users.login(data.email, data.password);
    }

}
```

**Your application must have some user entity.**

**Options:**

* `withCredentials`: (`boolean`, default: `false`), option passed to @angular/common/http interceptor: [api](https://angular.io/api/http/RequestOptions#withCredentials)
* `loginPage`: (`string`, default: `/login`), router link to your login page
* `tokenStorage`: (`string`, default: `ng-jwt-auth-token-data`), key which will be used for storing your jwt token in browser storage

**Methods:**

* `isServerLogout`:
    + Method called from @angular/common/http interceptor
    + Called on error response
    + Should return `true` if server wants you to logout the user
* `extractToken`:
    + Method called from @angular/common/http interceptor
    + Should return raw string token from http response or `undefined` if token does not exists in response
* `getUserByToken`:
    + Method called on page refresh if jwt token exists in browser storage (auto login on refresh)
    + Receives decoded jwt token from browser storage
    + Must return the `Observable` object with your user
* `login`:
    + Method called when user is being signed into your application
    + Must return the `Observable` object with your user
* `logout` (not required):
    + Method called when used is being logged out from your application

### Register configurator and ng-jwt-auth module

Now you only have to register your configurator class as a service and import the ng-jwt-auth module:

```typescript
import {NgModule} from '@angular/core';
import {AuthModule, AbstractAuthConfigurator} from '@webacad/ng-jwt-auth';
import {AuthConfigurator} from './auth';

@NgModule({
    imports: [
        AuthModule.forRoot(),
    ],
    providers: [
        {
            provide: AbstractAuthConfigurator,
            useClass: AuthConfigurator,
        },
    ],
})
export class AppModule {}
```

## AuthService

`AuthService` can be used for user authentication. It contains all the necessary methods and events:

* event `onLogin`: Called after user was logged in
* event `onLogout`: Called before user is logged out
* getter `loggedIn`: Returns `Observable<true>` if user is currently signed in. `Observable<false>` otherwise.
* getter `user`: Returns `Observable<User>` if user is currently signed in. `Observable<undefined>` otherwise.
* method `login(data: any)`: Should be used for user login.
* method `logout()`: Should be used for user logout.

**Example of usage:**

```typescript
import {AuthService} from '@webacad/ng-jwt-auth';
import {Observable} from 'rxjs/Observable';
import {User} from '../model/users';

export class UserInfo
{
    
    constructor(
        private $auth: AuthService<User>,
    ) {
        this.$auth.onLogin.subscribe(() => {
            alert('User was logged in');
        });
        
        this.$auth.onLogout.subscribe(() => {
            alert('User was logged out');
        });
    }
    
    public isLoggedIn(): Observable<boolean>
    {
        return this.$auth.loggedIn;
    }
    
    public getUser(): Observable<User|undefined>
    {
        return this.$auth.user;
    }
    
    public login(email: string, password: string): Observable<User>
    {
        return this.$auth.login({
            email,
            password,
        });
    }
    
    public logout(): void
    {
        this.$auth.logout();
    }
    
}
```

## HTTP interceptor

The build in `AuthHttpInterceptor` is automatically registered into your application.

It automatically:

* Adds the bearer authorization token into all requests if user is logged in
* Monitors inactivity logouts from server
* Automatically updates the jwt token after each request (if the token is present in HTTP response)

## LoggedInAuthGuard

Simple router guard which prohibits access to route(s) for all anonymous users.

See angular [documentation](https://angular.io/guide/router#milestone-5-route-guards) for how to use the guard. 

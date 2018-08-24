import {Injectable} from '@angular/core';
import {Router, CanActivate, CanActivateChild, RouterStateSnapshot, ActivatedRouteSnapshot} from '@angular/router';
import {Observable} from 'rxjs';

import {AbstractAuthConfigurator} from './abstract-auth-configurator';
import {AuthService} from './auth.service';


@Injectable()
export class LoggedInAuthGuard<U> implements CanActivate, CanActivateChild
{


	constructor(
		private $config: AbstractAuthConfigurator<U>,
		private $auth: AuthService<U>,
		private $router: Router,
	) {}


	public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean>
	{
		return this.checkLogin(state.url);
	}


	public canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean>
	{
		return this.canActivate(route, state);
	}


	private checkLogin(url: string): Observable<boolean>
	{
		return Observable.create((subscriber) => {
			this.$auth.loggedIn.subscribe((loggedIn) => {
				if (loggedIn) {
					subscriber.next(loggedIn);
					subscriber.complete();

					return;
				}

				this.$auth.redirectUrl = url;
				this.$router.navigate([this.$config.loginPage]);

				subscriber.next(false);
				subscriber.complete();
			});
		});
	}


}

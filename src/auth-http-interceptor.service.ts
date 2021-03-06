import {Injectable} from '@angular/core';
import {HttpInterceptor, HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError as ObservableThrow} from 'rxjs';
import {tap, catchError} from 'rxjs/operators';

import {AbstractAuthConfigurator} from './abstract-auth-configurator';
import {AuthTokenStorage} from './auth-token-storage.service';
import {AuthService, LogoutReason} from './auth.service';


@Injectable()
export class AuthHttpInterceptor<U> implements HttpInterceptor
{


	constructor(
		private $config: AbstractAuthConfigurator<U>,
		private $tokens: AuthTokenStorage<U>,
		private $auth: AuthService<U>,
	) {}


	public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>
	{
		let duplicate = req.clone({
			withCredentials: this.$config.withCredentials,
		});

		if (!this.$tokens.isEmpty()) {
			duplicate = duplicate.clone({
				headers: req.headers.set('Authorization', `Bearer ${this.$tokens.token}`),
			});
		}

		return next.handle(duplicate).pipe(
			catchError((err: HttpErrorResponse) => {
				let serverLogoutReason = this.$config.isServerLogout(err);

				if (typeof serverLogoutReason === 'undefined' || serverLogoutReason === true) {
					serverLogoutReason = LogoutReason.ServerLogout;
				}

				if (serverLogoutReason !== false) {
					this.$auth.logout(serverLogoutReason);
				}

				return ObservableThrow(err);
			}),
			tap((event: HttpEvent<any>) => {
				if (event instanceof HttpResponse && typeof event.body === 'object') {
					const newToken = this.$config.extractToken(event);

					if (typeof newToken !== 'undefined') {
						this.$tokens.token = newToken;
					}
				}
			}),
		);
	}

}

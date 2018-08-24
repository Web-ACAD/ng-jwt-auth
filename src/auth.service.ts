import {Injectable, EventEmitter} from '@angular/core';
import {Observable, of as ObservableOf} from 'rxjs';
import {tap, map, catchError} from 'rxjs/operators';

import {AbstractAuthConfigurator} from './abstract-auth-configurator';
import {AuthTokenStorage} from './auth-token-storage.service';


export enum LogoutReason
{
	Logout,
	ServerLogout,
}


export declare interface OnLoginArgs<U>
{
	user: U,
}


export declare interface OnLogoutArgs<U>
{
	user: U,
	reason: LogoutReason|any,
}


@Injectable()
export class AuthService<U>
{


	public readonly onLogin: EventEmitter<OnLoginArgs<U>> = new EventEmitter<OnLoginArgs<U>>();

	public readonly onLogout: EventEmitter<OnLogoutArgs<U>> = new EventEmitter<OnLogoutArgs<U>>();

	public redirectUrl: string|undefined;

	private _user: U;


	constructor(
		private $config: AbstractAuthConfigurator<U>,
		private $tokens: AuthTokenStorage<U>,
	) {}


	get loggedIn(): Observable<boolean>
	{
		return this.user.pipe(
			map((user) => typeof user !== 'undefined'),
		);
	}


	get user(): Observable<U|undefined>
	{
		if (typeof this._user !== 'undefined') {
			return ObservableOf(this._user);
		}

		if (this.$tokens.isEmpty()) {
			return ObservableOf(undefined);
		}

		const token = this.$tokens.readToken();

		return this.$config.getUserByToken<U>(token).pipe(
			catchError(() => ObservableOf(undefined)),
			tap((user) => this._user = user),
		);
	}


	public login<D = any>(data: D): Observable<U>
	{
		return this.$config.login(data).pipe(
			tap((user) => this._user = user),
			tap((user) => this.onLogin.emit({
				user: user,
			})),
		);
	}


	public logout(reason: LogoutReason|any = LogoutReason.Logout): void
	{
		this.onLogout.emit({
			user: this._user,
			reason: reason,
		});

		this.$config.logout(this._user, reason);
		this._user = undefined;
		this.$tokens.clear();
	}

}

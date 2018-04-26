import {Injectable} from '@angular/core';
import {NgStore} from '@webacad/ng-store';
import jwtDecode from 'jwt-decode';

import {AbstractAuthConfigurator} from './abstract-auth-configurator';


@Injectable()
export class AuthTokenStorage<U>
{


	private _token: string|false|undefined;


	constructor(
		private $config: AbstractAuthConfigurator<U>,
		private $store: NgStore,
	) {}


	get token(): string|undefined
	{
		if (typeof this._token === 'undefined') {
			this._token = this.$store.get<string|false>(this.$config.tokenStorage, false);
		}

		if (this._token === false) {
			return;
		}

		return this._token;
	}


	set token(token: string)
	{
		this._token = token;
		this.$store.set(this.$config.tokenStorage, token);
	}


	public readToken<T = any>(): T|undefined
	{
		const token = this.token;

		if (typeof token === 'undefined') {
			return;
		}

		return jwtDecode<T>(token);
	}


	public isEmpty(): boolean
	{
		if (this._token === false) {
			return true;
		}

		if (typeof this._token !== 'undefined') {
			return false;
		}

		return !this.$store.get<string>(this.$config.tokenStorage);
	}


	public clear(): void
	{
		this._token = undefined;
		this.$store.remove(this.$config.tokenStorage);
	}

}

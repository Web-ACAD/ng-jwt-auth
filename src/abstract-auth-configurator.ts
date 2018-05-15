import {HttpResponse, HttpErrorResponse} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';

import {LogoutReason} from './auth.service';


export declare interface AuthConfiguratorOptions
{
	withCredentials?: boolean,
	loginPage?: string,
	tokenStorage?: string,
}


const defaultAuthConfiguratorOptions: AuthConfiguratorOptions = {
	withCredentials: false,
	loginPage: '/login',
	tokenStorage: 'ng-jwt-auth-token-data',
};


export abstract class AbstractAuthConfigurator<U>
{


	public readonly withCredentials: boolean;

	public readonly loginPage: string;

	public readonly tokenStorage: string;


	constructor(options: AuthConfiguratorOptions = {})
	{
		options = {...defaultAuthConfiguratorOptions, ...options};

		this.withCredentials = options.withCredentials;
		this.loginPage = options.loginPage;
		this.tokenStorage = options.tokenStorage;
	}


	public abstract isServerLogout(err: HttpErrorResponse): boolean|LogoutReason|any;

	public abstract extractToken<T = any>(response: HttpResponse<T>): string|undefined;

	public abstract getUserByToken<T = any>(token: T): Observable<U>;

	public abstract login<D = any>(data: D): Observable<U>;

}

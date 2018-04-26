import {NgModule, ModuleWithProviders} from '@angular/core';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {NgStoreModule} from '@webacad/ng-store';

import {AuthService} from './auth.service';
import {AuthTokenStorage} from './auth-token-storage.service';
import {AuthHttpInterceptor} from './auth-http-interceptor.service';
import {LoggedInAuthGuard} from './logged-in-auth-guard.service';


@NgModule({
	imports: [
		NgStoreModule,
	],
})
export class AuthModule
{


	public static forRoot(): ModuleWithProviders
	{
		return {
			ngModule: AuthModule,
			providers: [
				AuthService,
				AuthTokenStorage,
				LoggedInAuthGuard,
				{
					provide: HTTP_INTERCEPTORS,
					useClass: AuthHttpInterceptor,
					multi: true,
				},
			],
		};
	}

}

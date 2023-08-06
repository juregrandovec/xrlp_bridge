import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { XrplListenerService } from '../xrpl/xrpl-listener.service';

@Injectable()
export class RefreshXrplListenerAccountListInterceptor implements NestInterceptor {
  constructor(private readonly xrplService: XrplListenerService) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(() => {
        this.xrplService.refreshSubscription();
      }),
    );
  }
}
import { HttpEvent } from "@angular/common/http";
import { HttpHandler } from "@angular/common/http";
import { HttpInterceptor } from "@angular/common/http";
import { HttpRequest } from "@angular/common/http";
import { HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { of } from "rxjs";
import { share } from "rxjs/operators";
import { tap } from "rxjs/operators";

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<any>,
    handler: HttpHandler
  ): Observable<HttpEvent<any>> {
    // quick exit if not a GET for text and cache requested
    if (
      request.method !== "GET" ||
      request.responseType !== "text" ||
      !request.headers.get("x-cache-result")
    )
      return handler.handle(request);
    // check if there's a cached response
    const body = localStorage.getItem(request.urlWithParams);
    if (body) {
      const response = new HttpResponse({ body, status: 200 });
      return of(response);
    }
    // let the request proceed and cache the response body
    const requestHandle = handler.handle(request).pipe(
      tap((response) => {
        if (response instanceof HttpResponse) {
          try {
            localStorage.setItem(request.urlWithParams, response.body);
          } catch (e) {
            console.error(response.body.length);
          }
        }
      }),
      share()
    );
    return requestHandle;
  }
}

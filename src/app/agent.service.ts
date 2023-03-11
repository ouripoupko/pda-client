import { Injectable } from '@angular/core';
import { Contract, Method } from './contract';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AgentService {

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient
  ) { }


  listen(server: string, identity: string): EventSource {
    return new EventSource(`${server}stream?agent=${identity}&contract=`);
  }

  isExistAgent(server: string, identity: string): Observable<Boolean> {
    let params = new HttpParams().set('action', 'is_exist_agent');
    return this.http.get<Boolean>(`${server}ibc/app/${identity}`, {params: params}).pipe(
        tap(_ => console.log('query agent')),
        catchError(this.handleError<Boolean>('isExistsAgent', false))
      );
  }

  registerAgent(server: string, identity: string): Observable<Boolean> {
    let params = new HttpParams().set('action', 'register_agent');
    return this.http.put<Boolean>(`${server}ibc/app/${identity}`, {}, {...this.httpOptions, params:params} ).pipe(
      tap(_ => console.log('added new identity')),
      catchError(this.handleError<Boolean>('registerAgent'))
    );
  }

  getContracts(server: string, identity: string): Observable<Contract[]> {
    let params = new HttpParams().set('action', 'get_contracts');
    return this.http.get<Contract[]>(`${server}ibc/app/${identity}`, {params: params}).pipe(
        tap(_ => console.log('fetched contracts')),
        catchError(this.handleError<Contract[]>('getContracts', []))
      );
  }

  addContract(server: string, agent: string, contract: Contract): Observable<Boolean> {
    console.log('add new contract:', contract);
    let params = new HttpParams().set('action', 'deploy_contract');
    return this.http.put<Boolean>(`${server}ibc/app/${agent}`,
                                    contract,
                                    {...this.httpOptions, params: params}).pipe(
      tap(_ => console.log('added contract')),
      catchError(this.handleError<Boolean>('addContract'))
    );
  }

  joinContract(server: string, agent: string,
               address: string, other_agent: string, contract_id: string): Observable<any> {
    let params = new HttpParams().set('action', 'join_contract');
    return this.http.put(`${server}ibc/app/${agent}`,
                         { address: address, agent: other_agent, contract: contract_id },
                          {...this.httpOptions, params: params}).pipe(
      tap(_ => console.log(`connected to ${address} with contract ${contract_id}`)),
      catchError(this.handleError<any>('connect'))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      //  send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}

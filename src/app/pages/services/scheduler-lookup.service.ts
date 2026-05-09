import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserLookup } from '../models/user-lookup.model';
import { Observable } from 'rxjs';
import { PartyAccountLookup } from '../models/party-account-lookup.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SchedulerLookupService {
  private apiUrl = `${environment.apiUrl}/SchedulerLookup`;
  //private apiUrl = 'https://localhost:7005/api/SchedulerLookup';

  constructor(private http: HttpClient) {}

  getUsers(
    search: string = '',
    userType: string = '',
    adminType: string = ''
  ): Observable<UserLookup[]> {
    return this.http.get<UserLookup[]>(`${this.apiUrl}/users`, {
      params: {
        search,
        userType,
        adminType
      }
    });
  }

  getPartyAccounts(
    search: string = '',
    partyType: string = '',
    branchType: string = '',
    dealerType: string = ''
  ): Observable<PartyAccountLookup[]> {
    return this.http.get<PartyAccountLookup[]>(`${this.apiUrl}/party-accounts`, {
      params: {
        search,
        partyType,
        branchType,
        dealerType
      }
    });
  }
}

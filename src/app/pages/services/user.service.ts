import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/User`;
  //private apiUrl = 'https://localhost:7005/api/User';

  private listChanged = new Subject<void>();
  listChanged$ = this.listChanged.asObservable();

  constructor(private http: HttpClient) {}

  saveUser(data: User): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/save`, data);
  }

  getAllUsers(
    search: string = '',
    pageNumber: number = 1,
    pageSize: number = 10
  ): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}`, {
      params: {
        search,
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString()
      }
    });
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  notifyListChanged() {
    this.listChanged.next();
  }
  
}

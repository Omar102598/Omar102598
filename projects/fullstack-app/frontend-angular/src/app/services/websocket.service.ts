import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import { Subject, Observable } from 'rxjs';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private client: Client | null = null;
  private messageSubject = new Subject<any>();

  connect(projectId: string): Observable<any> {
    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8090/ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        this.client?.subscribe(`/topic/tasks/${projectId}`, (message: IMessage) => {
          const payload = JSON.parse(message.body);
          this.messageSubject.next(payload);
        });
      },
      onStompError: (frame) => {
        console.error('WebSocket STOMP error:', frame);
      }
    });
    this.client.activate();
    return this.messageSubject.asObservable();
  }

  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
  }
}

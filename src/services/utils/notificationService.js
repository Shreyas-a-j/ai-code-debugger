import { Subject } from 'rxjs';

export class NotificationService {
  constructor() {
    this.notifications$ = new Subject();
  }

  show(message, type = 'info', duration = 3000) {
    const notification = {
      id: Date.now(),
      message,
      type,
      duration,
    };
    this.notifications$.next(notification);
  }

  success(message, duration) {
    this.show(message, 'success', duration);
  }

  error(message, duration) {
    this.show(message, 'error', duration);
  }

  info(message, duration) {
    this.show(message, 'info', duration);
  }

  warning(message, duration) {
    this.show(message, 'warning', duration);
  }
}

export const notificationService = new NotificationService(); 
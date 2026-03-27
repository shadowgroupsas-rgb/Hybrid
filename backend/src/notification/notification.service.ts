import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationService implements OnModuleInit {
  onModuleInit() {
    // Only initialize if not already initialized
    if (admin.apps.length === 0) {
      try {
        admin.initializeApp({
          credential: admin.credential.applicationDefault(), // Relies on GOOGLE_APPLICATION_CREDENTIALS env var
        });
        console.log('Firebase Admin Initialized');
      } catch (error) {
      console.warn('Fallo la inicialización de Firebase Admin (probablemente faltan credenciales). Las notificaciones push serán simuladas.', error.message);
      }
    }
  }

  async sendPushNotification(token: string, title: string, body: string) {
    if (!token) return;

    try {
      if (admin.apps.length > 0) {
        await admin.messaging().send({
          token,
          notification: {
            title,
            body,
          },
        });
        console.log(`Notification sent to ${token}`);
      } else {
        console.log(`[MOCK] Sending Notification to ${token}: ${title} - ${body}`);
      }
    } catch (error) {
      console.error('Error sending notification', error);
    }
  }
}

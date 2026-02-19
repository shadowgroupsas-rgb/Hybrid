import { Entity, Column, PrimaryGeneratedColumn, AfterInsert, AfterUpdate } from 'typeorm';
import * as QRCode from 'qrcode';

@Entity()
export class City {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: 20, comment: 'Tracking time in minutes after shift ends' })
  postShiftTrackingDuration: number;

  @Column({ type: 'text', nullable: true })
  qrCodeData: string; // Base64 or URL

  // Generates QR Code after entity is created/updated
  @AfterInsert()
  @AfterUpdate()
  async generateQRCode() {
    if (!this.qrCodeData && this.name) {
      try {
        // Unique string for the QR code: e.g., copower://city/{id}
        const uniqueString = `copower://city/${this.id}`;
        this.qrCodeData = await QRCode.toDataURL(uniqueString);
      } catch (err) {
        console.error('Error generating QR code', err);
      }
    }
  }
}

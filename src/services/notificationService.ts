import { BookingRecord } from '../types/payment';

export interface EmailNotificationPayload {
  to: string;
  subject: string;
  htmlBody: string;
  ticketQrToken: string;
}

export interface SmsNotificationPayload {
  to: string; // Nepal phone number e.g. 98XXXXXXXX
  message: string;
  senderId?: string; // e.g. GAJURI_CNM
}

export interface PushNotificationPayload {
  userId?: string;
  title: string;
  body: string;
  data: Record<string, string>;
}

export class NotificationService {

  /**
   * Generates and simulates sending Email Ticket Confirmation
   */
  public async sendEmailTicket(booking: BookingRecord): Promise<{ success: boolean; messageId: string }> {
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; background-color: #090a0e; color: #ffffff; padding: 24px; border-radius: 16px;">
        <h2 style="color: #d4af37; margin-bottom: 8px;">🎬 Booking Confirmed! - Gajuri Cinemas</h2>
        <p style="color: #cbd5e1; font-size: 14px;">Dear <strong>${booking.customer_name}</strong>,</p>
        <p style="color: #cbd5e1; font-size: 14px;">Thank you for booking with Gajuri Cinemas. Your payment via <strong>${booking.payment_method.toUpperCase()}</strong> has been verified.</p>
        
        <div style="background-color: #12131c; border: 1px solid #d4af37; border-radius: 12px; padding: 16px; margin: 16px 0;">
          <p style="margin: 4px 0; font-size: 14px;"><strong>Booking Reference:</strong> <span style="color: #d4af37; font-weight: bold;">${booking.booking_reference}</span></p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Movie:</strong> ${booking.movie_title}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Cinema / Screen:</strong> ${booking.hall_name} (${booking.format})</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Showtime:</strong> ${booking.show_date} @ ${booking.show_time}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Seats:</strong> ${booking.seat_numbers.join(', ')}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Amount Paid:</strong> NPR ${booking.amount.toLocaleString()}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Transaction ID:</strong> ${booking.transaction_id || 'VERIFIED'}</p>
        </div>

        <p style="font-size: 12px; color: #94a3b8;">Please present your digital QR code at the entrance scanner gate 15 minutes before showtime.</p>
        <p style="font-size: 12px; color: #64748b;">Gajuri Cinemas, Prithvi Highway, Gajuri, Dhading, Nepal</p>
      </div>
    `;

    console.log(`[NotificationService] Sending Email to ${booking.customer_email}`);
    return { success: true, messageId: `msg_email_${Date.now()}` };
  }

  /**
   * Generates and simulates sending SMS Ticket Confirmation
   * Compatible with Sparrow SMS & Aakash SMS Nepal APIs
   */
  public async sendSmsTicket(booking: BookingRecord): Promise<{ success: boolean; smsId: string }> {
    const textMessage = `Gajuri Cinemas: Booking ${booking.booking_reference} CONFIRMED! ${booking.movie_title}, Seats: ${booking.seat_numbers.join(',')}, ${booking.show_date} @ ${booking.show_time}. Present QR at entrance.`;

    console.log(`[NotificationService] Sending SMS to ${booking.customer_phone}: "${textMessage}"`);
    return { success: true, smsId: `sms_${Date.now()}` };
  }

  /**
   * Generates Push Notification
   */
  public async sendPushNotification(booking: BookingRecord): Promise<{ success: boolean }> {
    console.log(`[NotificationService] Sending Push Notification for booking ${booking.booking_reference}`);
    return { success: true };
  }

  /**
   * Dispatches all post-payment notifications
   */
  public async notifyPaymentSuccess(booking: BookingRecord): Promise<void> {
    try {
      await Promise.allSettled([
        this.sendEmailTicket(booking),
        this.sendSmsTicket(booking),
        this.sendPushNotification(booking)
      ]);
    } catch (err) {
      console.warn('Error in notification dispatch:', err);
    }
  }
}

export const notificationService = new NotificationService();

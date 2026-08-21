import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from './keys/emailConfig';

export const sendMaintenanceReminder = async (toEmail, message) => {
    try {
        const response = await emailjs.send(
            EMAILJS_CONFIG.SERVICE_ID,
            EMAILJS_CONFIG.TEMPLATE_ID,
            {
                to_email: toEmail,
                title: 'Streetlight Maintenance Due',
                name: 'Maintenance System',
                time: new Date().toLocaleString(),
                message: message,
            },
            EMAILJS_CONFIG.PUBLIC_KEY
        );
        return { success: true, response };
    } catch (error) {
        console.error('EmailJS error:', error);
        return { success: false, error };
    }
};
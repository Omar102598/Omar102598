package com.portfolio.notification.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class NotificationService {

    private final JavaMailSender mailSender;

    @Autowired(required = false)
    public NotificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public NotificationService() {
        this.mailSender = null;
    }

    public void sendEmailNotification(String to, String subject, String body) {
        log.info("Sending email notification to: {}, subject: {}", to, subject);

        if (mailSender == null) {
            log.warn("JavaMailSender not configured. Email not sent. To: {}, Subject: {}, Body: {}", to, subject, body);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true);
            mailSender.send(message);
            log.info("Email sent successfully to: {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send email to: {}. Error: {}", to, e.getMessage(), e);
        }
    }

    public void sendSmsNotification(String phoneNumber, String message) {
        log.info("Sending SMS notification to: {}, message: {}", phoneNumber, message);
        // Placeholder: integrate with SMS provider (Twilio, AWS SNS, etc.)
        log.info("SMS notification logged for phone: {} with message: {}", phoneNumber, message);
    }
}

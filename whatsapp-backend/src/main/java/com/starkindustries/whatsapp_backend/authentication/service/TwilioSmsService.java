package com.starkindustries.whatsapp_backend.authentication.service;

import com.starkindustries.whatsapp_backend.authentication.dto.response.SendOtpResponse;
import com.starkindustries.whatsapp_backend.authentication.model.Otp;
import com.starkindustries.whatsapp_backend.exceptions.CustomException;
import com.twilio.http.TwilioRestClient;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.apache.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class TwilioSmsService {
    
    @Value("${twilio.account.sid}")
    private String accountSid;
    
    @Value("${twilio.auth.token}")
    private String authToken;
    
    @Value("${twilio.sms.from}")
    private String fromNumber;
    
    private TwilioRestClient restClient;// ✅ CHANGED: TwilioRestClient

    @Autowired
    public OtpService otpService;
    
    @PostConstruct
    public void init() {
        // ✅ FIXED: Use TwilioRestClient.Builder
        restClient = new TwilioRestClient.Builder(accountSid, authToken).build();
        log.info("✅ TwilioRestClient initialized with SID: {}", accountSid.substring(0, 8) + "...");
    }
    
    public SendOtpResponse sendOtp(String toNumber, String otp) {
        try {
            // ✅ FIXED: Pass restClient to create()

            if(toNumber.length()==13){
            Message.creator(
                new PhoneNumber(toNumber),           // To: +919876543210
                new PhoneNumber(fromNumber),         // From: +15551234567
                "Your WhatsApp OTP: " + otp + "\nValid for 5 minutes only."
            ).create(restClient);  // ✅ Pass restClient here!

            Otp otp2 = Otp.builder()
            .phoneNumber(toNumber)
            .otp(otp)
            .createdAt(System.currentTimeMillis())
            .build();

            log.info("📱 SMS sent successfully to: {}", toNumber);

            return this.otpService.saveOtp(otp2);
            }else{
                log.error("Length of phone number is not 10 it is:"+toNumber.length());
                throw new CustomException(HttpStatus.SC_BAD_REQUEST,"Length of the mobile number should be 10");
            }

        
            
        } catch (Exception e) {
            log.error("❌ SMS failed for {}: {}", toNumber, e.getMessage());
            throw new RuntimeException("Failed to send OTP to " + toNumber, e);
        }
    }
}

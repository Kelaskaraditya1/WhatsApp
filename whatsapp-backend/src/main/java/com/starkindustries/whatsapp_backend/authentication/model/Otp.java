package com.starkindustries.whatsapp_backend.authentication.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Otp {

    private String phoneNumber;
    private String otp;
    private long createdAt;

    public boolean isOtpExpired(){
        return (System.currentTimeMillis()-createdAt) > 1000L*60*5;
    }
    
}
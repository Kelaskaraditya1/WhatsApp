package com.starkindustries.whatsapp_backend.authentication.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@Data
@NoArgsConstructor
@Builder
public class SendOtpResponse {

    private String phoneNumber;
    private String otp;
    private String message;
    
}

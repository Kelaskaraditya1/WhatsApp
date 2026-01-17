package com.starkindustries.whatsapp_backend.authentication.dto.request;
import com.starkindustries.whatsapp_backend.authentication.enums.AuthType;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SignupRequest {
    private String name;
    private String email;
    private String contact;
    private AuthType authType;
    private String providerId;
    private String username;
    private String password;
}

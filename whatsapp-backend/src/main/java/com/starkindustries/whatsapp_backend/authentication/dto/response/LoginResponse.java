package com.starkindustries.whatsapp_backend.authentication.dto.response;

import com.starkindustries.whatsapp_backend.authentication.model.Users;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LoginResponse {
    private Users users;
    private String jwtToken;
    private String tokenType;
}

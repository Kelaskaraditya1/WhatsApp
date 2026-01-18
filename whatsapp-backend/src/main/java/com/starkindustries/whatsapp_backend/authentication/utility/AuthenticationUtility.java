package com.starkindustries.whatsapp_backend.authentication.utility;

import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;

import com.starkindustries.whatsapp_backend.authentication.dto.request.SignupRequest;
import com.starkindustries.whatsapp_backend.authentication.enums.AuthType;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class AuthenticationUtility {

    public AuthType getAuthType(String registrationId){
        return switch(registrationId.toLowerCase()){
            case "google" -> AuthType.GOOGLE;
            case "github" -> AuthType.GITHUB;

            default -> throw new IllegalArgumentException("Not a valid Authentication Type");
        };
    }

    public String getProviderId(String registrationId, OAuth2User oAuth2User){

        return switch(registrationId.toLowerCase()){
            case "google" -> oAuth2User.getAttribute("sub");
            case "github" -> oAuth2User.getAttribute("id").toString();

            default -> throw new IllegalArgumentException("Not a Authentication Type");
        };

    }

    public SignupRequest getSignupRequest(OAuth2User oAuth2User,String registrationId){

        String email = oAuth2User.getAttribute("email");
        String username = email.split("@gmail.com")[0];
        String name = oAuth2User.getName();

        SignupRequest signupRequest = null;

        switch(registrationId.toLowerCase()){

            case "google" -> {
                
                log.info("Profile pic url:"+oAuth2User.getAttribute("picture").toString());

                signupRequest = SignupRequest.builder()
                .name(name)
                .email(email)
                .contact(null)
                .authType(AuthType.GOOGLE)
                .providerId(oAuth2User.getAttribute("sub"))
                .profilePicUrl(oAuth2User.getAttribute("picture").toString())
                .username(username)
                .password(null)
                .build();
            }

            case "github" -> {

                signupRequest = SignupRequest.builder()
                .name(name)
                .email(email)
                .contact(null)
                .authType(AuthType.GITHUB)
                .providerId(oAuth2User.getAttribute("id").toString())
                .username(username)
                .password(null)
                .build();
            }

            default -> throw new IllegalArgumentException("Not a valid Authentication Option");

        };

        return signupRequest;


    }
    
}

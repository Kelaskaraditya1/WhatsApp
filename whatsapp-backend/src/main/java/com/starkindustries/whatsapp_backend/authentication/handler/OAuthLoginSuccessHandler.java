package com.starkindustries.whatsapp_backend.authentication.handler;

import org.springframework.stereotype.Component;
import com.starkindustries.whatsapp_backend.authentication.dto.response.LoginResponse;
import com.starkindustries.whatsapp_backend.authentication.service.AuthenticationService;
import com.starkindustries.whatsapp_backend.authentication.utility.AuthenticationUtility;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

@Component
@Slf4j
public class OAuthLoginSuccessHandler implements AuthenticationSuccessHandler {

    @Autowired
    public AuthenticationService authenticationService;

    @Autowired
    public AuthenticationUtility authenticationUtility;

    @Value("${frontend.callback.url}")
    private String frontendCallbackUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        try {
            OAuth2AuthenticationToken oAuth2AuthenticationToken = (OAuth2AuthenticationToken) authentication;
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
            String providerId = oAuth2AuthenticationToken.getAuthorizedClientRegistrationId();

            log.info("OAuth2 login successful for provider: {}", providerId);

            ResponseEntity<LoginResponse> loginResponse = this.authenticationService.loginWithOAuth2(oAuth2User, providerId);

            if (loginResponse.getBody() != null && loginResponse.getBody().getJwtToken() != null) {
                String jwtToken = loginResponse.getBody().getJwtToken();
                
                // Redirect to React app with token as query parameter
                String redirectUrl = frontendCallbackUrl + "?token=" + URLEncoder.encode(jwtToken, StandardCharsets.UTF_8);
                log.info("Redirecting to frontend: {}", frontendCallbackUrl);
                
                response.sendRedirect(redirectUrl);
            } else {
                log.error("OAuth2 login failed: No JWT token generated");
                response.sendRedirect(frontendCallbackUrl + "?error=no_token");
            }
            
        } catch (Exception e) {
            log.error("OAuth2 login error: {}", e.getMessage(), e);
            String errorMessage = URLEncoder.encode(e.getMessage(), StandardCharsets.UTF_8);
            response.sendRedirect(frontendCallbackUrl + "?error=oauth_failed&message=" + errorMessage);
        }



    }
    
}

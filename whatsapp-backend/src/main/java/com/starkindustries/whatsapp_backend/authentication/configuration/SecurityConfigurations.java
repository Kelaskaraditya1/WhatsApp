package com.starkindustries.whatsapp_backend.authentication.configuration;

import java.io.IOException;
import java.util.Arrays;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.starkindustries.whatsapp_backend.authentication.filter.JwtFilter;
import com.starkindustries.whatsapp_backend.authentication.handler.OAuthLoginSuccessHandler;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@EnableWebSecurity
@Configuration
@Slf4j
public class SecurityConfigurations {

    @Autowired
    public UserDetailsService userDetailsService;

    @Autowired
    public JwtFilter jwtFilter;

    @Autowired
    public OAuthLoginSuccessHandler oAuthLoginSuccessHandler;

    @Bean
    public BCryptPasswordEncoder getBCryptPasswordEncoder(){
        try{
            return new BCryptPasswordEncoder(12);
        }catch(Exception e){
            log.error("Error: "+e.getMessage());
            e.printStackTrace();
        }

        return null;
    }

    @Bean
    public SecurityFilterChain getSecurityFilterChain(HttpSecurity httpSecurity) {

        return httpSecurity.
        csrf(
            csrf->csrf.disable()
        )
        .cors(
            cors->cors.configurationSource(getConfigurationSource())
        )
        .httpBasic(Customizer.withDefaults())
        .sessionManagement(
            session->session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        )
        .authenticationProvider(getAuthenticationProvider())
        .authorizeHttpRequests(
            request->request.requestMatchers("/auth/**",
            "/oauth2/**",
            "/login/oauth2/**",
            "/auth/login",
            "/auth/signup",
            "/chat/**",
            "/recent/**",
            "/create/**",
            "/accept/**",
            "/group/**",
            "/ws/**"
        )
            .permitAll()
            .anyRequest()
            .authenticated()
        )
        .exceptionHandling(
            exception->exception.authenticationEntryPoint(
                (request, response, authException)->{
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter()
                    .write(
                            "{\"status\": \"UNAUTHORIZED\", \"statusCode\": 401, \"message\": \"" 
                            + authException.getMessage() + "\"}"
                    );
                }
            )
        )
        .addFilterBefore(jwtFilter,UsernamePasswordAuthenticationFilter.class)
        .oauth2Login(
            oauth->oauth.successHandler(this.oAuthLoginSuccessHandler)
            .failureHandler(
                new AuthenticationFailureHandler() {

                    @Override
                    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                            AuthenticationException exception) throws IOException, ServletException {
                                log.error("OAuth Error: "+exception.getMessage());
                                exception.printStackTrace();
                    }
                    
                }
            )
        )
        .build();
        

    }

    @Bean
    public AuthenticationProvider getAuthenticationProvider(){

        try{
            DaoAuthenticationProvider daoAuthenticationProvider = new DaoAuthenticationProvider(this.userDetailsService);
            daoAuthenticationProvider.setPasswordEncoder(getBCryptPasswordEncoder());
            return daoAuthenticationProvider;
        }catch(Exception e){
            log.error("Error: "+e.getMessage());
            e.printStackTrace();   
        }

        return null;
    }

    @Bean
    public AuthenticationManager gAuthenticationManager(AuthenticationConfiguration authenticationConfiguration){

        try{
            return authenticationConfiguration.getAuthenticationManager();
        }catch(Exception e){
            log.error("Error: "+e.getMessage());
            e.printStackTrace();
        }

        return null;
    }

    @Bean
    public CorsConfigurationSource getConfigurationSource(){

        CorsConfiguration corsConfiguration = new CorsConfiguration();

        corsConfiguration.setAllowedOrigins(
            Arrays.asList("http://localhost:3000")
        );

        corsConfiguration.setAllowedHeaders(
            Arrays.asList("*")
        );

        corsConfiguration.setAllowedMethods(
            Arrays.asList("GET","POST","PUT","DELETE","OPTIONS")
        );

        corsConfiguration.setAllowCredentials(true);

        corsConfiguration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource urlBasedCorsConfigurationSource = new UrlBasedCorsConfigurationSource();
        urlBasedCorsConfigurationSource.registerCorsConfiguration("/**",corsConfiguration);

        return urlBasedCorsConfigurationSource;
    }
    
}

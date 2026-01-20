package com.starkindustries.whatsapp_backend.authentication.filter;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.starkindustries.whatsapp_backend.authentication.service.JwtService;
import com.starkindustries.whatsapp_backend.authentication.service.MyUserDetailsService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class JwtFilter extends OncePerRequestFilter{

    @Autowired
    public JwtService jwtService;

    @Autowired
    public MyUserDetailsService myUserDetailsService;

        @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.equals("/auth/**") || 
               path.startsWith("/oauth2/") ||
               path.startsWith("/login/oauth2/") ||
               path.startsWith("/auth/login") ||
               path.startsWith("/auth/signup")||
               path.startsWith("/auth/send/otp")||
               path.startsWith("/auth/verify/login/otp")||
               path.startsWith("/auth/verify/otp") ||
               path.startsWith("/chat/**")||
               path.startsWith("/ws/**");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

            String authToken = request.getHeader("Authorization");
            String username=null;
            String jwtToken=null;

            if(authToken==null || !authToken.startsWith("Bearer ")){                
                filterChain.doFilter(request, response);
                log.error("Jwt Token is null");
                return;
            }

            jwtToken = authToken.substring(7);
            username = this.jwtService.extractUserName(jwtToken);

            if(username!=null && SecurityContextHolder.getContext().getAuthentication()==null){

                UserDetails userDetails = this.myUserDetailsService.loadUserByUsername(username);

                if(userDetails!=null && this.jwtService.validateToken(jwtToken, userDetails)){

                    UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    usernamePasswordAuthenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);

                }
            }

            filterChain.doFilter(request, response);

    }
    
}


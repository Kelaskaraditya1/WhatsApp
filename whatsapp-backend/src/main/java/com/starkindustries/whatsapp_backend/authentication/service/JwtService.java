package com.starkindustries.whatsapp_backend.authentication.service;

import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.mongodb.Function;
import com.starkindustries.whatsapp_backend.authentication.model.Users;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class JwtService {

    @Value("${jwt.secret}")
    public String secretKey;

    @Value("${jwt.expiration}")
    public Long jwtExpiration;

    public String generateJwtToken(Users users){

        Map<String,Object> claims = new HashMap<>();

        claims.put(com.starkindustries.whatsapp_backend.keys.Keys.USER_ID,users.getUserId());
        claims.put(com.starkindustries.whatsapp_backend.keys.Keys.NAME,users.getName());
        claims.put(com.starkindustries.whatsapp_backend.keys.Keys.EMAIL, users.getEmail());
        claims.put(com.starkindustries.whatsapp_backend.keys.Keys.CONTACT,users.getContact());
        claims.put(com.starkindustries.whatsapp_backend.keys.Keys.AUTH_TYPE, users.getAuthType());
        claims.put(com.starkindustries.whatsapp_backend.keys.Keys.USERNAME,users.getUsername());

        return Jwts.builder()
        .claims()
        .add(claims)
        .subject(users.getUsername())
        .and()
        .signWith(getKey())
        .issuedAt(new Date(System.currentTimeMillis()))
        .expiration(new Date(System.currentTimeMillis()+jwtExpiration))
        .compact();
    }

    public SecretKey getKey(){
        byte[] byteKey = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(byteKey);
    }

    public String extractUserName(String token) {
        // extract the username from jwt token
        return extractClaim(token, Claims::getSubject);
    }

    public  <T> T extractClaim(String token, Function<Claims, T> claimResolver) {
        final Claims claims = extractAllClaims(token);
        return claimResolver.apply(claims);
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        final String userName = extractUserName(token);
        return (userName.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
    

    
}
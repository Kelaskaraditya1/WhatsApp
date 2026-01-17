package com.starkindustries.whatsapp_backend.authentication.model;

import java.io.Serializable;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.starkindustries.whatsapp_backend.authentication.enums.AuthType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Document
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Users implements Serializable{

@Id
private String userId;
private String name;
private String email;
private String contact;
private String profilePicUrl;
private AuthType authType;
private String username;
private String providerId;
private String password;
    
}
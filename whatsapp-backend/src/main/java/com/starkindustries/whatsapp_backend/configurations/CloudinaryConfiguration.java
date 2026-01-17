package com.starkindustries.whatsapp_backend.configurations;

import java.util.HashMap;
import java.util.Map;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.cloudinary.Cloudinary;
import com.starkindustries.whatsapp_backend.keys.Keys;

import org.springframework.beans.factory.annotation.Value;

@Configuration
public class CloudinaryConfiguration {

    @Value("${cloudinary.cloud.name}")
    public String cloudName;

    @Value("${cloudinary.api.key}")
    public String apiKey;

    @Value("${cloudinary.api.secret}")
    public String apiSecret;

    @Bean
    public Cloudinary gerCloudinaryConfiguration(){

        Map<String,Object> configurations = new HashMap<>();

        configurations.put(Keys.CLOUD_NAME, cloudName);
        configurations.put(Keys.API_KEY,apiKey );
        configurations.put(Keys.API_SECRET, apiSecret);
        configurations.put(Keys.SECURE,true);

        return new Cloudinary(configurations);
    }
    
}

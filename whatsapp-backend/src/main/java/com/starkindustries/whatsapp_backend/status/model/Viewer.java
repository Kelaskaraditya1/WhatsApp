package com.starkindustries.whatsapp_backend.status.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Viewer {

    private String userId;
    private String username;
    private String profilePicUrl;
    
}

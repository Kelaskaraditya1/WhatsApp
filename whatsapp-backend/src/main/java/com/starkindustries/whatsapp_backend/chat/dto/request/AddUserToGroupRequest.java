package com.starkindustries.whatsapp_backend.chat.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AddUserToGroupRequest {

    private String groupId;
    private String userId;
    
}

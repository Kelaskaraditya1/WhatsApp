package com.starkindustries.whatsapp_backend.chat.dto.request;

import java.util.List;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateGroupRequest {

    private String groupName;
    private String createdBy;
    private String status;
    private List<String> participantId;
    
}

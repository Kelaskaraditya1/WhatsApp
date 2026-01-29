package com.starkindustries.whatsapp_backend.calls.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.starkindustries.whatsapp_backend.calls.enums.CallType;
import com.starkindustries.whatsapp_backend.calls.enums.CallMediaType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document
public class Call {

    @Id
    private String callId;
    private String userId;
    private CallType callType;
    private CallMediaType callMediaType;
    private String callerId;
    private String receiverId;
    private String groupId;
    private Long timeStamp;
    
}

package com.starkindustries.whatsapp_backend.calls.dto.response;

import com.starkindustries.whatsapp_backend.calls.enums.CallMediaType;
import com.starkindustries.whatsapp_backend.calls.enums.CallType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CallResponse {

    private String callId;
    private CallType callType;
    private CallMediaType callMediaType;
    private String callerId;
    private String receiverName;
    private String groupName;
    private String profilePicUrl;
    private Long timeStamp;
    
}

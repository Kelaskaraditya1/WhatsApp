package com.starkindustries.whatsapp_backend.calls.dto.request;

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
public class CallRequest {

    private String callerId;
    private String receiverId;
    private String groupId;
    private CallType callType;
    private CallMediaType callMediaType;
    
}

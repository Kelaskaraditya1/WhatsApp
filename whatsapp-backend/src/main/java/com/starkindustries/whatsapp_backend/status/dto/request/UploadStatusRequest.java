package com.starkindustries.whatsapp_backend.status.dto.request;

import com.starkindustries.whatsapp_backend.status.enums.StatusType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UploadStatusRequest {


    private String caption;
    private String mediaUrl;
    private StatusType statusType;
    private String userId;
    
}

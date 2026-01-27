package com.starkindustries.whatsapp_backend.status.dto.response;

import java.util.List;

import com.starkindustries.whatsapp_backend.status.model.Status;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GetStatusResponse {

    private String userId;
    private String username;
    private String profilePicUrl;
    private boolean isMine;
    private List<Status> statusList;


    
}

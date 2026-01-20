package com.starkindustries.whatsapp_backend.chat.dto.request;

import com.starkindustries.whatsapp_backend.chat.enums.ChatType;
import com.starkindustries.whatsapp_backend.chat.enums.MessageType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MessageRequest {

    private String senderId;
    private String reciverId;
    private String message;
    private String mediaUrl;
    private ChatType chatType;
    private MessageType messageType;

    
}

package com.starkindustries.whatsapp_backend.chat.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

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
@Document
public class Message {

    @Id
    private String id;
    private String senderId;
    private String reciverId;
    private String chatRoomId;
    private String message;
    private ChatType chatType;
    private MessageType messageType;
    private String mediaUrl;
    private Long timeStamp;

}

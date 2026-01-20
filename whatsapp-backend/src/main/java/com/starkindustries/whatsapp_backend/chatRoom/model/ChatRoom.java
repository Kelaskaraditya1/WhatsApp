package com.starkindustries.whatsapp_backend.chatRoom.model;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document
public class ChatRoom {

    @Id
    private String id;
    private String senderId;
    private List<String> recentChatIds;

    public void addNewChatId(String chatId){
        if(!this.recentChatIds.contains(chatId))
            this.recentChatIds.add(chatId);
    }
    
}

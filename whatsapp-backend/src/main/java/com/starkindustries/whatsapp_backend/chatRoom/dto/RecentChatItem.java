package com.starkindustries.whatsapp_backend.chatRoom.dto;

import com.starkindustries.whatsapp_backend.authentication.model.Users;
import com.starkindustries.whatsapp_backend.chat.model.Group;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentChatItem {
    
    private String type; // "dm" or "group"
    private Users user;  // Only set if type is "dm"
    private Group group; // Only set if type is "group"
    
    public static RecentChatItem fromUser(Users user) {
        return RecentChatItem.builder()
            .type("dm")
            .user(user)
            .build();
    }
    
    public static RecentChatItem fromGroup(Group group) {
        return RecentChatItem.builder()
            .type("group")
            .group(group)
            .build();
    }
}

package com.starkindustries.whatsapp_backend.chat.model;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document
public class Group {

    @Id
    private String groupId;
    private String createdBy;
    private String groupName;
    private String status;
    private String groupPicUrl;
    private List<String> participants;

    public void addParticipant(String participantId){
        this.participants.add(participantId);
    }

    public void removeParticipant(String participantId){
        this.participants.remove(participantId);
    }
    
}

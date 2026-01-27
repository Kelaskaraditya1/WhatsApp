package com.starkindustries.whatsapp_backend.chatRoom.repository;


import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.starkindustries.whatsapp_backend.chatRoom.model.ChatRoom;

@Repository
public interface ChatRoomRepository extends MongoRepository<ChatRoom,String> {

    public Optional<ChatRoom> findBySenderId(String senderId);
    public boolean existsBySenderId(String senderId);
    
}

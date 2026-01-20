package com.starkindustries.whatsapp_backend.chat.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.starkindustries.whatsapp_backend.chat.model.Message;

@Repository
public interface MessageRepository extends MongoRepository<Message,String>{

    List<Message> findByChatRoomId(String chatRoomId);

}

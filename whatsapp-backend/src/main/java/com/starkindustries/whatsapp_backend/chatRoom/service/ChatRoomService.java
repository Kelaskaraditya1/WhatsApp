package com.starkindustries.whatsapp_backend.chatRoom.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.starkindustries.whatsapp_backend.authentication.model.Users;
import com.starkindustries.whatsapp_backend.authentication.repository.AuthenticationRepository;
import com.starkindustries.whatsapp_backend.chatRoom.model.ChatRoom;
import com.starkindustries.whatsapp_backend.chatRoom.repository.ChatRoomRepository;
import com.starkindustries.whatsapp_backend.exceptions.CustomException;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ChatRoomService {

    @Autowired
    public ChatRoomRepository chatRoomRepository;

    @Autowired
    public AuthenticationRepository authenticationRepository;

    public ChatRoom getOrCreateChatRoom(String senderId){

        if(senderId== null || senderId.isEmpty() || senderId.isBlank()){
            log.error("Enter proper senderID");
            throw new CustomException(HttpStatus.SC_BAD_REQUEST,"Enter proper senderId");
        }

        ChatRoom chatRoom = this.chatRoomRepository.findBySenderId(senderId)
        .orElse(null);

        if(chatRoom!=null){
            log.info("Chatroom already exists");
            return chatRoom;
        }else{

            log.info("creating a new ChatRoom for userId: {}",senderId);

            ChatRoom chatRoom2 = ChatRoom.builder()
            .id(UUID.randomUUID().toString())
            .senderId(senderId)
            .recentChatIds(new ArrayList<>())
            .build();

            return this.chatRoomRepository.save(chatRoom2);
        }

    }

    public ChatRoom addChatIdToChatRoom(String senderId, String chatId){

        ChatRoom chatRoom = getOrCreateChatRoom(senderId);
        chatRoom.addNewChatId(chatId);
        return this.chatRoomRepository.save(chatRoom);
    }

    public List<Users> getRecentChatUsers(String senderId){

        if(this.authenticationRepository.existsByUserId(senderId)){
            ChatRoom chatRoom = getOrCreateChatRoom(senderId);

            if(chatRoom.getRecentChatIds().isEmpty())
                return new ArrayList<>();

            return chatRoom.getRecentChatIds()
            .stream()
            .map(
                userId -> this.authenticationRepository.findByUserId(userId).get()
            )
            .collect(Collectors.toList());

        }else{
            log.error("User not found");
            throw new CustomException(HttpStatus.SC_BAD_REQUEST,"User not found");
        }

    }
    
}

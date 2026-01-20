package com.starkindustries.whatsapp_backend.chat.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.starkindustries.whatsapp_backend.chat.service.ChatService;
import com.starkindustries.whatsapp_backend.chatRoom.service.ChatRoomService;

import java.util.*;

import com.starkindustries.whatsapp_backend.authentication.model.Users;
import com.starkindustries.whatsapp_backend.chat.model.Message;

@RestController
@RequestMapping()
public class ChatDetailsController {

    @Autowired
    public ChatService chatService;

    @Autowired
    public ChatRoomService chatRoomService;

    @GetMapping("/chat/messages/{chatRoomId}")
    public ResponseEntity<?> getChatMessages(
        @PathVariable("chatRoomId") String chatRoomId
    ){

        if(chatRoomId==null || chatRoomId.isEmpty() || chatRoomId.isBlank())
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_GATEWAY).body("Enter proper ChatId");

        List<Message> message = this.chatService.getMessage(chatRoomId);
        return ResponseEntity.status(org.springframework.http.HttpStatus.OK).body(message);


    }

    @GetMapping("/recent/chats/{userId}")
    public ResponseEntity<?> getRecentChats(
        @PathVariable("userId") String userId
    ){
        if(userId == null || userId.isEmpty() || userId.isBlank())
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Enter proper userId");

        List<Users> users = this.chatRoomService.getRecentChatUsers(userId);
        return ResponseEntity.status(HttpStatus.OK).body(users);
    }

    @PostMapping(
        value = "/chat/upload/media", 
        consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> uploadFile(
        @RequestParam("file") MultipartFile multipartFile
    ){

        if(multipartFile==null)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Enter proper File");

        Map<String,Object> response = new HashMap<>();

        String downloadUrl = this.chatService.uploadFile(multipartFile);
        response.put("download-url", downloadUrl);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
    
}

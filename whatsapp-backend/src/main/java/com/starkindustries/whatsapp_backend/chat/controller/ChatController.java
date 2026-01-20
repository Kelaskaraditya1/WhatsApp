package com.starkindustries.whatsapp_backend.chat.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.starkindustries.whatsapp_backend.chat.dto.request.MessageRequest;
import com.starkindustries.whatsapp_backend.chat.enums.ChatType;
import com.starkindustries.whatsapp_backend.chat.model.Message;
import com.starkindustries.whatsapp_backend.chat.service.ChatService;

@Controller
public class ChatController {

    @Autowired
    public ChatService chatService;

    @Autowired
    public SimpMessagingTemplate simpMessagingTemplatep;

    @MessageMapping("/dm/message")
    public Message sendMessage(
        @Payload MessageRequest sendMessageRequest
    ){

        
        if(sendMessageRequest.getChatType()==ChatType.DM){
         Message message = this.chatService.saveMessage(sendMessageRequest);
         this.simpMessagingTemplatep.convertAndSend("/topic/dm/"+message.getChatRoomId(),message);
         return message;   
        }

        return null;
    }
    
}

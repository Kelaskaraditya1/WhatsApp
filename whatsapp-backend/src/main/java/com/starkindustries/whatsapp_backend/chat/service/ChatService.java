package com.starkindustries.whatsapp_backend.chat.service;

import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.starkindustries.whatsapp_backend.chat.dto.request.MessageRequest;
import com.starkindustries.whatsapp_backend.chat.enums.MessageType;
import com.starkindustries.whatsapp_backend.chat.model.Message;
import com.starkindustries.whatsapp_backend.chat.repository.MessageRepository;
import com.starkindustries.whatsapp_backend.chatRoom.service.ChatRoomService;
import com.starkindustries.whatsapp_backend.cloudinary.CloudinaryService;
import com.starkindustries.whatsapp_backend.exceptions.CustomException;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ChatService {

    @Autowired
    public MessageRepository messageRepository;

    @Autowired
    public ChatRoomService chatRoomService;

    @Autowired
    public CloudinaryService cloudinaryService;

    public String getChatRoomId(String chatId1, String chatId2) {

        if (chatId1.compareTo(chatId2) <= 0)
            return chatId1 + "_" + chatId2;
        else
            return chatId2 + "_" + chatId1;

    }

    public Message saveMessage(MessageRequest sendMessageRequest) {

        if (sendMessageRequest.getSenderId() == null || sendMessageRequest.getSenderId().isBlank()
                || sendMessageRequest.getSenderId().isEmpty()) {
            log.error("Enter proper senderId");
            throw new CustomException(HttpStatus.BAD_REQUEST.value(), "Enter proper senderId");
        } else if (sendMessageRequest.getReciverId() == null || sendMessageRequest.getReciverId().isBlank()
                || sendMessageRequest.getReciverId().isEmpty()) {
            log.error("Enter proper receiverId");
            throw new CustomException(HttpStatus.BAD_REQUEST.value(), "Enter proper receiverId");
        } else if (sendMessageRequest.getMessage() == null || sendMessageRequest.getMessage().isBlank()
                || sendMessageRequest.getMessage().isEmpty()) {
            log.error("Enter proper message");
            throw new CustomException(HttpStatus.BAD_REQUEST.value(), "Enter proper message");
        } else if (sendMessageRequest.getMessageType() == null) {
            log.error("Enter proper messageType");
            throw new CustomException(HttpStatus.BAD_REQUEST.value(), "Enter proper messageType");
        }

        this.chatRoomService.addChatIdToChatRoom(sendMessageRequest.getSenderId(), sendMessageRequest.getReciverId());
        this.chatRoomService.addChatIdToChatRoom(sendMessageRequest.getReciverId(), sendMessageRequest.getSenderId());

        Message message = Message.builder()
                .id(UUID.randomUUID().toString())
                .senderId(sendMessageRequest.getSenderId())
                .reciverId(sendMessageRequest.getReciverId())
                .chatRoomId(getChatRoomId(sendMessageRequest.getSenderId(), sendMessageRequest.getReciverId()))
                .message(sendMessageRequest.getMessage())
                .chatType(sendMessageRequest.getChatType())
                .messageType(sendMessageRequest.getMessageType())
                .mediaUrl(sendMessageRequest.getMediaUrl())
                .timeStamp(System.currentTimeMillis())
                .build();

        return this.messageRepository.save(message);

    }

    public List<Message> getMessage(String chatRoomId) {

        if (chatRoomId == null || chatRoomId.isEmpty() || chatRoomId.isBlank()) {
            log.error("Enter proper chatRoomId");
            throw new CustomException(HttpStatus.BAD_REQUEST.value(), "Enter proper chatRoomId");
        }

        List<Message> messages = this.messageRepository.findByChatRoomId(chatRoomId);
        return messages;

    }

    public String uploadFile(MultipartFile multipartFile) {

        String downloadUrl = this.cloudinaryService.uploadToCloudinary(multipartFile);

        if (downloadUrl != null && !downloadUrl.isEmpty() && !downloadUrl.isBlank())
            return downloadUrl;
        else {
            log.error("Failed to upload file");
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Failed to upload file");
        }

    }

}

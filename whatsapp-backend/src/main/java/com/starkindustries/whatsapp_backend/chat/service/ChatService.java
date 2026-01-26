package com.starkindustries.whatsapp_backend.chat.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.starkindustries.whatsapp_backend.authentication.repository.AuthenticationRepository;
import com.starkindustries.whatsapp_backend.chat.dto.request.AddUserToGroupRequest;
import com.starkindustries.whatsapp_backend.chat.dto.request.CreateGroupRequest;
import com.starkindustries.whatsapp_backend.chat.dto.request.MessageRequest;
import com.starkindustries.whatsapp_backend.chat.enums.ChatType;
import com.starkindustries.whatsapp_backend.chat.model.Group;
import com.starkindustries.whatsapp_backend.chat.model.Message;
import com.starkindustries.whatsapp_backend.chat.repository.GroupRepository;
import com.starkindustries.whatsapp_backend.chat.repository.MessageRepository;
import com.starkindustries.whatsapp_backend.chatRoom.model.ChatRoom;
import com.starkindustries.whatsapp_backend.chatRoom.repository.ChatRoomRepository;
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

    @Autowired
    public AuthenticationRepository authenticationRepository;

    @Autowired
    public GroupRepository groupRepository;

    @Autowired
    public SimpMessagingTemplate simpMessagingTemplate;

    @Autowired
    public ChatRoomRepository chatRoomRepository;

    public String getChatRoomId(String chatId1, String chatId2) {

        if (chatId1.compareTo(chatId2) <= 0)
            return chatId1 + "_" + chatId2;
        else
            return chatId2 + "_" + chatId1;

    }

    public Message saveDmMessage(MessageRequest sendMessageRequest) {

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

    public Message saveGroupMessage(MessageRequest messageRequest) {

        if (this.groupRepository.existsById(messageRequest.getGroupId())) {

            Message message = Message.builder()
                    .id(UUID.randomUUID().toString())
                    .senderId(messageRequest.getSenderId())
                    .chatRoomId(messageRequest.getGroupId()) // For groups, chatRoomId = groupId
                    .message(messageRequest.getMessage())
                    .chatType(ChatType.GROUP)
                    .messageType(messageRequest.getMessageType())
                    .mediaUrl(messageRequest.getMediaUrl())
                    .timeStamp(System.currentTimeMillis())
                    .build();

            // Add groupId to sender's recent chats
            this.chatRoomService.addChatIdToChatRoom(messageRequest.getSenderId(), messageRequest.getGroupId());

            return this.messageRepository.save(message);

        } else {
            log.error("No such group with groupId" + messageRequest.getMediaUrl());
            throw new CustomException(HttpStatus.BAD_REQUEST.value(), "No such group");
        }

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

    public Group createGroup(CreateGroupRequest createGroupRequest, MultipartFile multipartFile) {

        if (!this.authenticationRepository.existsByUserId(createGroupRequest.getCreatedBy())) {
            log.error("Creator Id does not exists");
            throw new CustomException(HttpStatus.BAD_REQUEST.value(), "Creator Id does not exists");
        }

        String profillePicUrl = null;

        if (multipartFile != null)
            profillePicUrl = this.cloudinaryService.uploadToCloudinary(multipartFile);

        Group group = Group.builder()
                .groupId(UUID.randomUUID().toString())
                .createdBy(createGroupRequest.getCreatedBy())
                .groupName(createGroupRequest.getGroupName())
                .status(createGroupRequest.getStatus())
                .groupPicUrl(profillePicUrl)
                .participants(new ArrayList<>())
                .build();

        // Add creator as the first participant
        group.addParticipant(createGroupRequest.getCreatedBy());

        // Add groupId to creator's recent chats
        this.chatRoomService.addChatIdToChatRoom(createGroupRequest.getCreatedBy(), group.getGroupId());

        if (createGroupRequest.getParticipantId() == null || createGroupRequest.getParticipantId().isEmpty()) {
            log.error("Participants list is empty");
            throw new CustomException(HttpStatus.BAD_REQUEST.value(), "Participants list is empty");
        }

        List<String> partipants = createGroupRequest.getParticipantId()
                .stream()
                .filter(
                        userId -> this.authenticationRepository.existsByUserId(userId))
                .collect(Collectors.toList());

        partipants.stream()
                .forEach(
                        userId -> {
                            // Use topic-based messaging instead of user-destination
                            this.simpMessagingTemplate.convertAndSend(
                                    "/topic/invite/" + userId,
                                    group);
                        });

        return this.groupRepository.save(group);

    }

    public Group addUserToGroup(AddUserToGroupRequest addUserToGroupRequest) {

        Group group = this.groupRepository.findById(addUserToGroupRequest.getGroupId()).orElse(null);
        ChatRoom chatRoom = this.chatRoomService.getOrCreateChatRoom(addUserToGroupRequest.getUserId());

        if (group == null) {
            log.error("Group doesnot exist");
            throw new CustomException(HttpStatus.BAD_REQUEST.value(), "Group doesnot exist");
        }

        group.addParticipant(addUserToGroupRequest.getUserId());
        chatRoom.addNewChatId(group.getGroupId());

        this.groupRepository.save(group);
        this.chatRoomRepository.save(chatRoom);

        return group;

    }

    public Group getGroupById(String groupId) {
        return this.groupRepository.findById(groupId).orElse(null);
    }

}

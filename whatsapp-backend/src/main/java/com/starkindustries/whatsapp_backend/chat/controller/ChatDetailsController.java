package com.starkindustries.whatsapp_backend.chat.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.starkindustries.whatsapp_backend.chat.service.ChatService;
import com.starkindustries.whatsapp_backend.chatRoom.service.ChatRoomService;

import lombok.extern.slf4j.Slf4j;

import java.util.*;

import com.starkindustries.whatsapp_backend.authentication.model.Users;
import com.starkindustries.whatsapp_backend.chat.dto.request.AddUserToGroupRequest;
import com.starkindustries.whatsapp_backend.chat.dto.request.CreateGroupRequest;
import com.starkindustries.whatsapp_backend.chat.model.Group;
import com.starkindustries.whatsapp_backend.chat.model.Message;

@RestController
@Slf4j
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

        // Returns both users (DM) and groups
        var recentChats = this.chatRoomService.getRecentChats(userId);
        return ResponseEntity.status(HttpStatus.OK).body(recentChats);
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

    @PostMapping(
        value = "/create/group",
        consumes =  org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> createGroup(
        @RequestPart("group") CreateGroupRequest createGroupRequest,
        @RequestParam(value="file",required = false) MultipartFile multipartFile
    ){

        if(createGroupRequest==null)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Request Body is null");
        else if(createGroupRequest.getGroupName()==null || createGroupRequest.getGroupName().isEmpty() || createGroupRequest.getGroupName().isBlank())
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Enter proper Group Name");
        else if(createGroupRequest.getCreatedBy()==null || createGroupRequest.getCreatedBy().isEmpty() || createGroupRequest.getCreatedBy().isBlank())
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Enter proper userId of the user who created the group");

            Group group = this.chatService.createGroup(createGroupRequest, multipartFile);

            if(group != null)
                return ResponseEntity.status(HttpStatus.OK).body(group);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to form Group");


    }

    @PostMapping("/accept/group/invite")
    public ResponseEntity<?> acceptGroupInvite(
        @RequestBody AddUserToGroupRequest addUserToGroupRequest
    ){

        if(addUserToGroupRequest == null){
            log.error("Request Body is null");
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("Request Body is null");
        }else if(addUserToGroupRequest.getGroupId()== null || addUserToGroupRequest.getGroupId().isEmpty() || addUserToGroupRequest.getGroupId().isBlank()){
            log.error("Enter proper GroupId");
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("Enter proper GroupId");
        }else if(addUserToGroupRequest.getUserId() == null || addUserToGroupRequest.getUserId().isEmpty() || addUserToGroupRequest.getUserId().isBlank()){
            log.error("Enter proper UserId");
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("Enter proper UserId");
        }

        Group group = this.chatService.addUserToGroup(addUserToGroupRequest);
        if(group == null){
            log.error("Group returned from service is null");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to add user to group");
        }

        return ResponseEntity.status(HttpStatus.OK).body(group);


    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<?> getGroupById(
        @PathVariable("groupId") String groupId
    ){
        if(groupId == null || groupId.isEmpty() || groupId.isBlank()){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Enter proper groupId");
        }

        Group group = this.chatService.getGroupById(groupId);
        if(group == null){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Group not found");
        }

        return ResponseEntity.status(HttpStatus.OK).body(group);
    }
    
}

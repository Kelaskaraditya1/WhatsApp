package com.starkindustries.whatsapp_backend.status.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.starkindustries.whatsapp_backend.authentication.model.Users;
import com.starkindustries.whatsapp_backend.authentication.repository.AuthenticationRepository;
import com.starkindustries.whatsapp_backend.chatRoom.model.ChatRoom;
import com.starkindustries.whatsapp_backend.chatRoom.repository.ChatRoomRepository;
import com.starkindustries.whatsapp_backend.exceptions.CustomException;
import com.starkindustries.whatsapp_backend.status.dto.request.UploadStatusRequest;
import com.starkindustries.whatsapp_backend.status.dto.response.GetStatusResponse;
import com.starkindustries.whatsapp_backend.status.model.Status;
import com.starkindustries.whatsapp_backend.status.repository.StatusRepository;

import io.jsonwebtoken.lang.Collections;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class StatusService {

    @Autowired
    public StatusRepository statusRepository;

    @Autowired
    public AuthenticationRepository authenticationRepository;

    @Autowired
    public ChatRoomRepository chatRoomRepository;

    public Status uploadStatus(UploadStatusRequest uploadStatusRequest){

        Status status = Status.builder()
        .id(UUID.randomUUID().toString())
        .mediaUrl(uploadStatusRequest.getMediaUrl())
        .caption(uploadStatusRequest.getCaption())
        .statusType(uploadStatusRequest.getStatusType())
        .userId(uploadStatusRequest.getUserId())
        .viewers(new ArrayList<>())
        .createdAt(System.currentTimeMillis())
        .build();

        return this.statusRepository.save(status);

        

    }

    public List<GetStatusResponse> getAllStatus(String userId){

        // Check is the user who is sending the request exist or not

        if(!this.authenticationRepository.existsById(userId)){
            log.error("User does not exist with userId: "+userId);
            throw new CustomException(org.springframework.http.HttpStatus.BAD_REQUEST.value(), "User does not exist with userId: "+userId);
        }

        // check if the chatRoom with the userId exist or not 

        if(this.chatRoomRepository.findBySenderId(userId)==null){
            log.info("There is no ChatRoom with chatRoomId: "+userId);
            return Collections.emptyList();
        }

        ChatRoom chatRoom = null;

        if(this.chatRoomRepository.existsBySenderId(userId))
            chatRoom = this.chatRoomRepository.findBySenderId(userId).get();
        else{
            log.info("There is no ChatRoom with chatRoomId: "+userId);
            return Collections.emptyList();
        }
        List<String> rawParticipants = chatRoom.getRecentChatIds();

        // Check if user has chatted with someone or not

        if(rawParticipants.isEmpty()){
            log.info("participants list is empty");
            return Collections.emptyList();
        }

        // fetch the actual particpants and remove the group Id's

        List<String> participants = rawParticipants.stream()
        .filter(
            rawParticipantId-> this.authenticationRepository.existsByUserId(rawParticipantId)
        )
        .collect(Collectors.toList());

        List<GetStatusResponse> listOfStatus = new ArrayList<>();

        // for finding the status of the current user

        List<Status> currentUsersStatus = this.statusRepository.findByUserId(userId);
        if(!currentUsersStatus.isEmpty()){

            Users users = this.authenticationRepository.findById(userId).get();
            List<Status> validStatus = new ArrayList<>();
                    for(Status rawStatus: currentUsersStatus){
                        if(rawStatus.isStatusFresh())
                            validStatus.add(rawStatus);
                        else
                            this.statusRepository.deleteById(rawStatus.getId());
                    }

                    GetStatusResponse getStatusResponse = GetStatusResponse.builder()
                    .userId(userId)
                    .username(users.getUsername())
                    .profilePicUrl(users.getProfilePicUrl())
                    .isMine(true)
                    .statusList(validStatus)
                    .build();

                    listOfStatus.add(getStatusResponse);
        }



        participants.stream()
        .forEach(
            participantId->{
                Users users = this.authenticationRepository.findById(participantId).get();
                List<Status> rawStatusList = this.statusRepository.findByUserId(participantId);
                
                if(!rawStatusList.isEmpty()){

                    // check if the status is fresh(<24) or stale (>24)

                    List<Status> validStatusList = new ArrayList<>();

                    for(Status rawStatus: rawStatusList){
                        if(rawStatus.isStatusFresh())
                            validStatusList.add(rawStatus);
                        else
                            this.statusRepository.deleteById(rawStatus.getId());
                    }

                    GetStatusResponse getStatusResponse = GetStatusResponse.builder()
                    .userId(participantId)
                    .username(users.getUsername())
                    .profilePicUrl(users.getProfilePicUrl())
                    .isMine(false)
                    .statusList(validStatusList)
                    .build();

                    listOfStatus.add(getStatusResponse);
                }
                    
            }
        );


        return listOfStatus;
        
    }
    
}

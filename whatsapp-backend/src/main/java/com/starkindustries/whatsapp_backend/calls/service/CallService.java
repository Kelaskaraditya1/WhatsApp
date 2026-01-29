package com.starkindustries.whatsapp_backend.calls.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.starkindustries.whatsapp_backend.authentication.model.Users;
import com.starkindustries.whatsapp_backend.authentication.repository.AuthenticationRepository;
import com.starkindustries.whatsapp_backend.calls.dto.request.CallRequest;
import com.starkindustries.whatsapp_backend.calls.dto.response.CallResponse;
import com.starkindustries.whatsapp_backend.calls.enums.CallType;
import com.starkindustries.whatsapp_backend.calls.model.Call;
import com.starkindustries.whatsapp_backend.calls.repository.CallRepository;
import com.starkindustries.whatsapp_backend.chat.model.Group;
import com.starkindustries.whatsapp_backend.chat.repository.GroupRepository;
import com.starkindustries.whatsapp_backend.exceptions.CustomException;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class CallService {


    @Autowired
    public CallRepository callRepository;

    @Autowired
    public AuthenticationRepository authenticationRepository;

    @Autowired
    public GroupRepository groupRepository;


    public boolean addCall(CallRequest callRequest){

        if(!this.authenticationRepository.existsByUserId(callRequest.getCallerId())){
            log.error("Caller Id does not exist");
            throw new CustomException(HttpStatus.BAD_REQUEST.value(), "Caller Id does not exist");
        }

        if(callRequest.getCallType()==CallType.INDIVISUAL){

            if(!this.authenticationRepository.existsByUserId(callRequest.getReceiverId())){
            log.error("Receiver Id does not exist");
            throw new CustomException(HttpStatus.BAD_REQUEST.value(), "Receiver Id does not exist");
            }

            Call call1 = Call.builder()
            .callId(UUID.randomUUID().toString())
            .userId(callRequest.getCallerId())
            .callerId(callRequest.getCallerId())
            .receiverId(callRequest.getReceiverId())
            .callMediaType(callRequest.getCallMediaType())
            .callType(callRequest.getCallType())
            .timeStamp(System.currentTimeMillis())
            .build();

            Call call2 = Call.builder()
            .callId(UUID.randomUUID().toString())
            .userId(callRequest.getReceiverId())
            .callerId(callRequest.getCallerId())
            .receiverId(callRequest.getReceiverId())
            .callMediaType(callRequest.getCallMediaType())
            .callType(callRequest.getCallType())
            .timeStamp(System.currentTimeMillis())
            .build();

            this.callRepository.save(call1);
            this.callRepository.save(call2);

            return true;

        }else{

            if(!this.groupRepository.existsById(callRequest.getGroupId())){
                log.error("Group does not exists");
                throw new CustomException(HttpStatus.BAD_REQUEST.value(),"Group does not exist");
            }

            Group group = this.groupRepository.findById(callRequest.getGroupId()).get();

            group.getParticipants()
            .stream()
            .forEach(
                userId->{
                    Call call = Call.builder()
                    .callId(UUID.randomUUID().toString())
                    .userId(userId)
                    .callerId(callRequest.getCallerId())
                    .groupId(callRequest.getGroupId())
                    .callMediaType(callRequest.getCallMediaType())
                    .callType(callRequest.getCallType())
                    .timeStamp(System.currentTimeMillis())
                    .build();

                    this.callRepository.save(call);
                }
            );

            return true;

        }

    }

    public List<CallResponse> getCalls(String userId){

        if(!this.authenticationRepository.existsByUserId(userId)){
            log.error("Enter proper userId");
            throw new CustomException(HttpStatus.BAD_REQUEST.value(),"Enter proper user Id");
        }

        List<Call> calls = this.callRepository.findByUserId(userId);
        List<CallResponse> callResponseList = new ArrayList<>();  

        if(!calls.isEmpty()){
            calls.stream()
            .forEach(
                                call->{
                    if(call.getCallType()==CallType.INDIVISUAL){

                        // Determine which person to show (the OTHER person in the call)
                        String otherPersonId;
                        if (call.getUserId().equals(call.getCallerId())) {
                            // User made this call (outgoing) → show receiver
                            otherPersonId = call.getReceiverId();
                        } else {
                            // User received this call (incoming) → show caller
                            otherPersonId = call.getCallerId();
                        }

                        Users users = this.authenticationRepository.findByUserId(otherPersonId).get();

                        CallResponse callResponse = CallResponse.builder()
                        .callId(call.getCallId())
                        .callType(call.getCallType())
                        .callMediaType(call.getCallMediaType())
                        .callerId(call.getCallerId())
                        .receiverName(users.getName())
                        .profilePicUrl(users.getProfilePicUrl())
                        .timeStamp(call.getTimeStamp())
                        .build();

                        callResponseList.add(callResponse);

                    }else{

                        Group group = this.groupRepository.findByGroupId(call.getGroupId()).get();

                        CallResponse callResponse = CallResponse.builder()
                        .callId(call.getCallId())
                        .callType(call.getCallType())
                        .callMediaType(call.getCallMediaType())
                        .callerId(call.getCallerId())
                        .groupName(group.getGroupName())
                        .profilePicUrl(group.getGroupPicUrl())
                        .timeStamp(call.getTimeStamp())
                        .build();

                        callResponseList.add(callResponse);

                    }
                }
            );

            return callResponseList;
        }

        return Collections.emptyList();

    }
    
}

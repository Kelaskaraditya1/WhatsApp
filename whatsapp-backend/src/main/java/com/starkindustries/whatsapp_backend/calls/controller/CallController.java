package com.starkindustries.whatsapp_backend.calls.controller;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.starkindustries.whatsapp_backend.calls.dto.request.CallRequest;
import com.starkindustries.whatsapp_backend.calls.dto.response.CallResponse;
import com.starkindustries.whatsapp_backend.calls.enums.CallType;
import com.starkindustries.whatsapp_backend.calls.service.CallService;

@RestController
@RequestMapping("/call")
public class CallController {


    @Autowired
    public CallService callService;

    @PostMapping("/add")
    public ResponseEntity<?> addCall(@RequestBody CallRequest callRequest){

        if(callRequest== null)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Request body is null");

        else if(callRequest.getCallerId()== null || callRequest.getCallerId().isEmpty() || callRequest.getCallerId().isBlank())
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Enter proper Caller Id");

        else if(callRequest.getCallType()==null)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Enter proper Call Type");

        else if(callRequest.getCallType()==CallType.INDIVISUAL && (callRequest.getReceiverId()==null || callRequest.getReceiverId().isEmpty() || callRequest.getReceiverId().isBlank()))
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Enter proper sender Id");

        else if(callRequest.getCallType()==CallType.GROUP && (callRequest.getGroupId() == null || callRequest.getGroupId().isEmpty() || callRequest.getGroupId().isBlank()))
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Enter proper group Id");

        if(this.callService.addCall(callRequest))
            return ResponseEntity.status(HttpStatus.OK).body("Call added sucessfully");

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to add Call");

    }

    @GetMapping("/get/{userId}")
    public ResponseEntity<?> getCalls(@PathVariable("userId") String userId){

        if(userId == null || userId.isEmpty() || userId.isBlank())
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Enter proper userId");

        List<CallResponse> callResponse = this.callService.getCalls(userId);
        return ResponseEntity.status(HttpStatus.OK).body(callResponse);

    }


    
}

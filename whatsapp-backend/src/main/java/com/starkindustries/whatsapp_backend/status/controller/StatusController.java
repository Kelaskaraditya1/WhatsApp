package com.starkindustries.whatsapp_backend.status.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.starkindustries.whatsapp_backend.status.dto.request.UploadStatusRequest;
import com.starkindustries.whatsapp_backend.status.dto.response.GetStatusResponse;
import com.starkindustries.whatsapp_backend.status.enums.StatusType;
import com.starkindustries.whatsapp_backend.status.model.Status;
import com.starkindustries.whatsapp_backend.status.service.StatusService;

@RestController
@RequestMapping("/status")
public class StatusController {

    @Autowired
    public StatusService statusService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadStatus(@RequestBody UploadStatusRequest uploadStatusRequest){

        if(uploadStatusRequest== null)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST.value()).body("Request Body is null");

        else if(uploadStatusRequest.getUserId()== null || uploadStatusRequest.getUserId().isBlank() || uploadStatusRequest.getUserId().isEmpty())
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Enter proper UserId");

        else if(uploadStatusRequest.getStatusType()!=StatusType.TEXT && (uploadStatusRequest.getMediaUrl()== null || uploadStatusRequest.getMediaUrl().isEmpty() || uploadStatusRequest.getMediaUrl().isBlank()))
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Enter proper media Url");

        else if(uploadStatusRequest.getStatusType()==StatusType.TEXT && (uploadStatusRequest.getCaption()==null || uploadStatusRequest.getCaption().isEmpty() || uploadStatusRequest.getCaption().isBlank()))
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Enter proper Caption");

        Status status = this.statusService.uploadStatus(uploadStatusRequest);
        if(status!=null)
            return ResponseEntity.status(HttpStatus.OK).body(status);
        else
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload status");


    }

    @GetMapping("/get/{userId}")
    public ResponseEntity<?> getStatus(@PathVariable("userId") String userId){

        if(userId==null || userId.isEmpty() || userId.isBlank())
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Enter proper userId");

        List<GetStatusResponse> status = this.statusService.getAllStatus(userId);
        return ResponseEntity.status(HttpStatus.OK).body(status);

    }
    
}

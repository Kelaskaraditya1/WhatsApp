package com.starkindustries.whatsapp_backend.authentication.controller;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.starkindustries.whatsapp_backend.authentication.dto.request.LoginRequest;
import com.starkindustries.whatsapp_backend.authentication.dto.request.SendOtpRequest;
import com.starkindustries.whatsapp_backend.authentication.dto.request.SignupRequest;
import com.starkindustries.whatsapp_backend.authentication.dto.request.VerifyOtpRequest;
import com.starkindustries.whatsapp_backend.authentication.dto.response.LoginResponse;
import com.starkindustries.whatsapp_backend.authentication.dto.response.SendOtpResponse;
import com.starkindustries.whatsapp_backend.authentication.dto.response.SignupResponse;
import com.starkindustries.whatsapp_backend.authentication.dto.response.VerifyOtpResponse;
import com.starkindustries.whatsapp_backend.authentication.enums.AuthType;
import com.starkindustries.whatsapp_backend.authentication.model.UserPrinciple;
import com.starkindustries.whatsapp_backend.authentication.service.AuthenticationService;
import com.starkindustries.whatsapp_backend.authentication.service.JwtService;
import com.starkindustries.whatsapp_backend.authentication.service.OtpService;
import com.starkindustries.whatsapp_backend.authentication.service.TwilioSmsService;
import com.starkindustries.whatsapp_backend.exceptions.CustomException;
import com.starkindustries.whatsapp_backend.keys.Keys;

import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
@RequestMapping("/auth")
public class AuthenticationController {

    @Autowired
    public  TwilioSmsService twilioSmsService;

    @Autowired
    public AuthenticationService authenticationService;

    @Autowired
    public OtpService otpService;

    @Autowired
    public JwtService jwtService;


    @GetMapping("/greetings")
    public ResponseEntity<?> greetings(){

        Map<String,Object> response = new HashMap<>();
        response.put(Keys.TIMESTAMP, LocalDate.now());
        response.put(Keys.STATUS,HttpStatus.OK);
        response.put(Keys.STATUS_CODE,HttpStatus.OK.value());
        response.put(Keys.MESSAGE, "Greetings, I am Optimus Prime!!"); 
        
        return ResponseEntity.status(HttpStatus.OK).body(response);

    }

@PostMapping(value = "/signup", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<?> signup(
    @RequestPart("data") String jsonData,     // JSON as string  
        @RequestParam(value = "file", required = false) MultipartFile profilePic
) {
    // Parse JSON → Your existing SignupRequest
    ObjectMapper mapper = new ObjectMapper();

    try{
    SignupRequest signupRequest = mapper.readValue(jsonData, SignupRequest.class);

        if(signupRequest == null)
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Signup Request is null");
    
    SignupResponse signupResponse = this.authenticationService.signupWithUsrnameAndPassword(
        signupRequest, "Bearer", profilePic,AuthType.EMAIL
    );

    if(signupResponse!=null)
        return ResponseEntity.status(HttpStatus.OK).body(signupResponse);

    }catch(Exception e){
        log.error("Signup Error:"+e.getMessage());
        throw new CustomException(HttpStatus.BAD_REQUEST.value(),e.getMessage());
    }

    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to Signup");

}


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest){

        if(loginRequest==null)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Request Body is null!!");
        else if(loginRequest.getUsername()==null || loginRequest.getUsername().isEmpty() || loginRequest.getUsername().isEmpty())
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Enter proper Username");
        else if(loginRequest.getPassword()== null || loginRequest.getPassword().isBlank() || loginRequest.getPassword().isEmpty())
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Enter proper password");

            LoginResponse loginResponse = this.authenticationService.loginWithUsernameAndPassword(loginRequest);
            if(loginResponse!=null)
                return ResponseEntity.status(HttpStatus.OK).body(loginResponse);
            else
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Invalid Username or Password");

    }

    @PostMapping("/user/me")
    public ResponseEntity<?> currentUser(@AuthenticationPrincipal UserPrinciple userPrinciple){

        if(userPrinciple.getUsers()!=null)
            return ResponseEntity.status(HttpStatus.OK).body(userPrinciple.getUsers());
        else
            throw new CustomException(HttpStatus.BAD_REQUEST.value(), "Invalid or Expired Jwt token");

    }

    @PostMapping("/send/otp")
    public ResponseEntity<?> sendOtp(@RequestBody SendOtpRequest sendOtpRequest){

        String otp = String.valueOf((100000L + new Random().nextLong(900000L)));
        SendOtpResponse sendOtpResponse = this.twilioSmsService.sendOtp("+91"+sendOtpRequest.getPhoneNumber(),otp);

        return ResponseEntity.ok(sendOtpResponse);

    }

    @PostMapping("/verify/login/otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest verifyOtpRequesty){

        VerifyOtpResponse verifyOtpResponse = this.otpService.verifyOtp(verifyOtpRequesty);
        return ResponseEntity.ok(verifyOtpResponse);
    }


    @PostMapping("/verify/otp")
    public ResponseEntity<?> verifyLoginOtp(
        @RequestBody VerifyOtpRequest verifyOtpRequest
    ){

        if(verifyOtpRequest==null)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Verify Request is null");
        else if(verifyOtpRequest.getPhoneNumber()==null || verifyOtpRequest.getPhoneNumber().isEmpty() || verifyOtpRequest.getPhoneNumber().isBlank())
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Enter Valid Phone number");
        else if(verifyOtpRequest.getOtp()==null || verifyOtpRequest.getOtp().isEmpty() || verifyOtpRequest.getOtp().isBlank())
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Enter Valid Otp");

        if(this.otpService.verifyLoginOtp(verifyOtpRequest)){
            Map<String,Object> response = new HashMap<>();
            response.put(Keys.STATUS,true);
            response.put(Keys.MESSAGE, "Phone number verified Sucessfully");
            return ResponseEntity.status(HttpStatus.OK).body(response);
        }
        else{
            Map<String,Object> response = new HashMap<>();
            response.put(Keys.STATUS,false);
            response.put(Keys.MESSAGE, "Failed to verify Phone number, try again later.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
            

    }

    



       
}

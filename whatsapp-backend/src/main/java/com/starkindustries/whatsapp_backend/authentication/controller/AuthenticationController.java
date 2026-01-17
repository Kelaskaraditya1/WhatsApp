package com.starkindustries.whatsapp_backend.authentication.controller;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.starkindustries.whatsapp_backend.authentication.dto.request.LoginRequest;
import com.starkindustries.whatsapp_backend.authentication.dto.request.SendOtpRequest;
import com.starkindustries.whatsapp_backend.authentication.dto.request.SignupRequest;
import com.starkindustries.whatsapp_backend.authentication.dto.request.VerifyOtpRequest;
import com.starkindustries.whatsapp_backend.authentication.dto.response.LoginResponse;
import com.starkindustries.whatsapp_backend.authentication.dto.response.SendOtpResponse;
import com.starkindustries.whatsapp_backend.authentication.dto.response.SignupResponse;
import com.starkindustries.whatsapp_backend.authentication.dto.response.VerifyOtpResponse;
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

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest signupRequest){

        SignupResponse signupResponse = this.authenticationService.signupWithUsrnameAndPassword(signupRequest, "Bearer");
        return ResponseEntity.ok(signupResponse);

    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest){

            LoginResponse loginResponse = this.authenticationService.loginWithUsernameAndPassword(loginRequest);
            return ResponseEntity.ok(loginResponse);

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

        String otp = String.valueOf((100000L + new Random().nextLong(9000000L)));
        SendOtpResponse sendOtpResponse = this.twilioSmsService.sendOtp(sendOtpRequest.getPhoneNumber(),otp);

        return ResponseEntity.ok(sendOtpResponse);

    }

    @PostMapping("/verify/otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest verifyOtpRequesty){

        VerifyOtpResponse verifyOtpResponse = this.otpService.verifyOtp(verifyOtpRequesty);
        return ResponseEntity.ok(verifyOtpResponse);
    }

    



       
}

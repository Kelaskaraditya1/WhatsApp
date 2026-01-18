package com.starkindustries.whatsapp_backend.authentication.service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.apache.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.starkindustries.whatsapp_backend.authentication.dto.request.VerifyOtpRequest;
import com.starkindustries.whatsapp_backend.authentication.dto.response.SendOtpResponse;
import com.starkindustries.whatsapp_backend.authentication.dto.response.VerifyOtpResponse;
import com.starkindustries.whatsapp_backend.authentication.model.Otp;
import com.starkindustries.whatsapp_backend.authentication.model.Users;
import com.starkindustries.whatsapp_backend.authentication.repository.AuthenticationRepository;
import com.starkindustries.whatsapp_backend.exceptions.CustomException;
import java.util.*;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class OtpService {

    @Autowired
    public AuthenticationRepository authenticationRepository;

    @Autowired
    public JwtService jwtService;

    public Map<String,Otp> otpRecords = new ConcurrentHashMap<>();

    public SendOtpResponse saveOtp(Otp otp){

        if(otp!=null && 
            otp.getPhoneNumber()!=null && !otp.getPhoneNumber().isEmpty() &&
            otp.getOtp()!=null && !otp.getOtp().isEmpty()
        ){
            otpRecords.put(otp.getPhoneNumber(),otp);

            return SendOtpResponse.builder()
            .otp(otp.getOtp())
            .phoneNumber(otp.getPhoneNumber())
            .message("Otp send sucessfully to phone number "+otp.getPhoneNumber())
            .build();
        }else{
            if (otp.getPhoneNumber()==null) {
                log.error("Phone number is null!!");
                throw new CustomException(HttpStatus.SC_BAD_REQUEST,"Phone number is null");
            }else{
                log.error("Otp is null!!");
                throw new CustomException(HttpStatus.SC_BAD_REQUEST,"Otp is null");
            }
        }

    }

    public VerifyOtpResponse verifyOtp(VerifyOtpRequest verifyOtpRequest) {

        if(
            verifyOtpRequest!=null &&
            verifyOtpRequest.getOtp()!=null && !verifyOtpRequest.getOtp().isEmpty() &&
            verifyOtpRequest.getPhoneNumber()!=null && !verifyOtpRequest.getPhoneNumber().isEmpty()
        ){

            Otp otp = otpRecords.get("+91"+verifyOtpRequest.getPhoneNumber());

            if(otp!=null){

                if(otp.isOtpExpired()){
                    log.error("Otp is expired");
                    otpRecords.remove(otp.getPhoneNumber());
                    throw new CustomException(HttpStatus.SC_BAD_REQUEST, "Otp is expired");
                }else if(!otp.getOtp().equals(verifyOtpRequest.getOtp())){
                    log.error("Invalid Otp");
                    throw new CustomException(HttpStatus.SC_BAD_REQUEST, "Invalid otp");
                }else{
                    log.info("Phone number: "+otp.getPhoneNumber());
                    Users users = this.authenticationRepository.findAll()
                    .stream()
                .filter(user -> Objects.equals(user.getContact(), otp.getPhoneNumber().substring(3))) 
                    .findFirst()
                    .orElse(null);

                    if(users!=null){
                        otpRecords.remove("+91"+verifyOtpRequest.getPhoneNumber());
                        return VerifyOtpResponse.builder()
                        .users(users)
                        .jwtToken(this.jwtService.generateJwtToken(users))
                        .tokenType("Bearer")
                        .build();
                    }else{
                        log.error("User with this "+otp.getPhoneNumber()+" does not exist!!");
                        throw new CustomException(HttpStatus.SC_BAD_REQUEST, "User with this "+otp.getPhoneNumber()+" does not exist!!");
                    }
                }

            }else{
                log.error("Otp for the Phone number "+verifyOtpRequest.getPhoneNumber()+" doesnot exist!!");
                throw new CustomException(HttpStatus.SC_BAD_REQUEST, "Otp for the Phone number "+verifyOtpRequest.getPhoneNumber()+" doesnot exist!!");
            }

        }else{
            if(verifyOtpRequest.getOtp()==null){
                log.error("Otp is null");
            }else{
                log.error("Phone number is null!!");
            }
        }

        return null;
    }

    public boolean verifyLoginOtp(VerifyOtpRequest verifyOtpRequest){

        Otp otp = otpRecords.get("+91"+verifyOtpRequest.getPhoneNumber());

        if(otp==null){
            log.error("Otp doesnot exist for this Phone number");
            throw new CustomException(HttpStatus.SC_BAD_REQUEST, "Otp doesnot exist for this Phone number");
        }else if(otp.isOtpExpired()){
            log.error("Otp is Expired");
            otpRecords.remove(verifyOtpRequest.getPhoneNumber());
            throw new CustomException(HttpStatus.SC_BAD_REQUEST, "Otp is Expired");
        }else if(!verifyOtpRequest.getOtp().equals(otp.getOtp())){
            log.error("Invalid Otp");
            return false;
        }

        otpRecords.remove("+91"+verifyOtpRequest.getPhoneNumber());
        return true;


    }

    
    
}

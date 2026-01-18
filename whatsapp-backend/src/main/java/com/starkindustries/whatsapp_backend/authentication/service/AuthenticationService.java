package com.starkindustries.whatsapp_backend.authentication.service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.starkindustries.whatsapp_backend.authentication.dto.request.LoginRequest;
import com.starkindustries.whatsapp_backend.authentication.dto.request.SignupRequest;
import com.starkindustries.whatsapp_backend.authentication.dto.response.LoginResponse;  
import com.starkindustries.whatsapp_backend.authentication.dto.response.SignupResponse;
import com.starkindustries.whatsapp_backend.authentication.enums.AuthType;
import com.starkindustries.whatsapp_backend.authentication.model.Users;
import com.starkindustries.whatsapp_backend.authentication.repository.AuthenticationRepository;
import com.starkindustries.whatsapp_backend.authentication.utility.AuthenticationUtility;
import com.starkindustries.whatsapp_backend.configurations.CloudinaryConfiguration;
import com.starkindustries.whatsapp_backend.exceptions.CustomException;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class AuthenticationService {

    @Autowired
    public AuthenticationRepository authenticationRepository;

    @Autowired
    @Lazy
    public BCryptPasswordEncoder bCryptPasswordEncoder;

    @Autowired
    public JwtService jwtService;

    @Autowired
    @Lazy
    public AuthenticationManager authenticationManager;

    @Autowired
    public AuthenticationUtility authenticationUtility;

    @Autowired
    public CloudinaryConfiguration cloudinaryConfiguration;

    public SignupResponse signupWithUsrnameAndPassword(SignupRequest signupRequest,String tokenType, MultipartFile multipartFile, AuthType authType){

                if(this.authenticationRepository.existsByContact(signupRequest.getContact())){
                    log.error("Contact already exist");
                    throw new CustomException(HttpStatus.BAD_REQUEST.value(), "Contact already exist");
                }

                else if(this.authenticationRepository.existsByEmail(signupRequest.getEmail())){
                    log.error("Email already exist");
                    throw new CustomException(HttpStatus.BAD_REQUEST.value(),"Email already exist");
                }

                else if(this.authenticationRepository.existsByUsername(signupRequest.getUsername())){
                    log.error("Username already exist");
                    throw new CustomException(HttpStatus.BAD_REQUEST.value(),"Username already exist");
                }

                String profilePicUrl=null;

                if(multipartFile!=null && (signupRequest.getProfilePicUrl()==null || signupRequest.getProfilePicUrl().isEmpty() || signupRequest.getProfilePicUrl().isBlank()))
                    profilePicUrl= uploadToCloudinary(multipartFile);
                else if(authType!=AuthType.EMAIL && signupRequest.getProfilePicUrl()!=null && !signupRequest.getProfilePicUrl().isEmpty() && !signupRequest.getProfilePicUrl().isBlank())
                    profilePicUrl=signupRequest.getProfilePicUrl();

                Users users = Users.builder()
                .userId(UUID.randomUUID().toString())
                .name(signupRequest.getName())
                .email(signupRequest.getEmail())
                .contact(signupRequest.getContact())
                .profilePicUrl(profilePicUrl)
                .authType(authType)
                .providerId(signupRequest.getProviderId())
                .username(signupRequest.getUsername())
                .password(this.bCryptPasswordEncoder.encode(signupRequest.getPassword()))
                .build();

                this.authenticationRepository.save(users);

                return SignupResponse.builder()
                .users(users)
                .jwtToken(this.jwtService.generateJwtToken(users))
                .tokenType(tokenType)
                .build();
    }

    public LoginResponse loginWithUsernameAndPassword(LoginRequest loginRequest){



                Users users = this.authenticationRepository.findByUsernameOrEmail(loginRequest.getUsername(),loginRequest.getUsername()).get();

                if(users!=null){
                    Authentication authentication = this.authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(loginRequest.getUsername(),loginRequest.getPassword())
                    );

                    if(authentication.isAuthenticated()){

                        LoginResponse loginResponse = LoginResponse.builder()
                        .users(users)
                        .jwtToken(this.jwtService.generateJwtToken(users))
                        .tokenType("Bearer")
                        .build();

                        return loginResponse;
                    }
                }else{
                    log.error("User with username or email "+loginRequest.getUsername()+" does not exist");
                    throw new CustomException(HttpStatus.BAD_REQUEST.value(),"Invalid username or password");
                }

        return null;

    }

public ResponseEntity<LoginResponse> loginWithOAuth2(OAuth2User oAuth2User, String registrationId) {
    String providerId = this.authenticationUtility.getProviderId(registrationId, oAuth2User);
    AuthType authType = this.authenticationUtility.getAuthType(registrationId);
    
    String email = oAuth2User.getAttribute("email").toString();
    
    // ✅ FIXED: Safe Optional handling for OAuth user
    Optional<Users> optionalOAuthUser = this.authenticationRepository.findByProviderIdAndAuthType(providerId, authType);
    Users oAuthUser = optionalOAuthUser.orElse(null);
    
    // ✅ FIXED: Efficient email lookup (uses repo method)
    Optional<Users> optionalEmailUser = this.authenticationRepository.findByEmail(email);
    Users emailUsers = optionalEmailUser.orElse(null);
    
    Users users = null;

    if (oAuthUser != null) {
        log.info("OAuth User already exist with AuthType: {} and Provider Id: {}", 
                 oAuthUser.getAuthType(), oAuthUser.getProviderId());
        oAuthUser.setEmail(email);
        users = this.authenticationRepository.save(oAuthUser);
        
    } else if (emailUsers != null) {
        if (emailUsers.getAuthType() == authType) {
            log.info("User with email {} and Auth Type: {} exists", 
                     emailUsers.getEmail(), emailUsers.getAuthType());
            emailUsers.setProviderId(providerId);
            users = this.authenticationRepository.save(emailUsers);
        } else {
            log.error("User already has account with Auth Type: {}", emailUsers.getAuthType());
            throw new CustomException(HttpStatus.BAD_REQUEST.value(), 
                "User already has account with Auth Type: " + emailUsers.getAuthType());
        }
    } else {
        log.info("User does not exist, Signing up");
        SignupRequest signupRequest = this.authenticationUtility.getSignupRequest(oAuth2User, registrationId);
        log.info("Signup Request: {}", signupRequest);
        SignupResponse signupResponse = signupWithUsrnameAndPassword(signupRequest, "OAuth2", null,AuthType.GOOGLE);
        users = signupResponse.getUsers();
    }

    LoginResponse loginResponse = LoginResponse.builder()
        .users(users)
        .jwtToken(this.jwtService.generateJwtToken(users))
        .tokenType("OAuth2")
        .build();

    return ResponseEntity.status(HttpStatus.OK).body(loginResponse);
}


    public String uploadToCloudinary(MultipartFile multipartFile){

        Map data = new HashMap<>();

        try{

            String downloadUrl = this.cloudinaryConfiguration.gerCloudinaryConfiguration().uploader().upload(multipartFile.getBytes(), data)
            .get("secure_url")
            .toString();
            if(downloadUrl!=null && (downloadUrl.startsWith("http://") || downloadUrl.startsWith("https://")))
                return downloadUrl;
            else{
                log.error("failed to upload download url, might be null or does not start with http or https");
                throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR.value(),"failed to upload download url, might be null or does not start with http or https");
            }

        }catch(Exception e){
            log.error("Cloudinary Error: "+e.getMessage());
            e.printStackTrace();
        }

        return null;

    }

    public Users uploadProfilePic(MultipartFile multipartFile, String userId){

        Users users = this.authenticationRepository.findAll()
        .stream()
        .filter(
            user-> user.getUserId().equals(userId)
        ).findFirst()
        .orElse(null);

        if(users != null){

            String profilePicUrl = uploadToCloudinary(multipartFile);

            if(profilePicUrl!=null){
                users.setProfilePicUrl(profilePicUrl);
                this.authenticationRepository.save(users);
                return users;
            }else{
                log.error("profile pic url is null!!");
                throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR.value(),"profile pic url is null!!");
            }

        
        }else{
            log.error("User with userId: "+userId+" does not exist.");
            throw new CustomException(HttpStatus.BAD_REQUEST.value(),"User with userId: "+userId+" does not exist.");
        }


    }

    
}
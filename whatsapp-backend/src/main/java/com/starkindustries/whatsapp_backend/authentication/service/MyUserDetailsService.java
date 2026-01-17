package com.starkindustries.whatsapp_backend.authentication.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.starkindustries.whatsapp_backend.authentication.model.UserPrinciple;
import com.starkindustries.whatsapp_backend.authentication.model.Users;
import com.starkindustries.whatsapp_backend.authentication.repository.AuthenticationRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class MyUserDetailsService implements UserDetailsService{

    @Autowired
    public AuthenticationRepository authenticationRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        Users users = this.authenticationRepository.findByUsernameOrEmail(username, username).get();

        if(users!=null)
            return new UserPrinciple(users);
        else
            throw new UsernameNotFoundException("Username or Email doesnot exist!!");

    }

    
}
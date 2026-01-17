package com.starkindustries.whatsapp_backend.exceptions;

import java.util.HashMap;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import com.starkindustries.whatsapp_backend.keys.Keys;

import lombok.extern.slf4j.Slf4j;

@RestControllerAdvice
@Component
@Slf4j
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler{

    @ExceptionHandler(CustomException.class)
    public ResponseEntity<Map<String,Object>> globalExceptionHandler(CustomException customException){

        log.error("Error Status: "+customException.getHttpStatusCode());
        log.error("Error Message: "+customException.getMessage());

        Map<String,Object> response = new HashMap<>();

        response.put(Keys.STATUS_CODE,customException.getHttpStatusCode());
        response.put(Keys.MESSAGE,customException.getMessage());

        return ResponseEntity.status(customException.getHttpStatusCode()).body(response);
    } 
    
}

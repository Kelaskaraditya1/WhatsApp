package com.starkindustries.whatsapp_backend.exceptions;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CustomException extends RuntimeException{

    private int httpStatusCode;
    private long timeStamp = System.currentTimeMillis();

    public CustomException(int httpStatusCode , String message){
        super(message);
        this.httpStatusCode=httpStatusCode;
    }


}

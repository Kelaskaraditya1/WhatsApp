package com.starkindustries.whatsapp_backend.cloudinary;

import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;
import com.starkindustries.whatsapp_backend.exceptions.CustomException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class UploadUtility {

    public static  boolean containsExtension(MultipartFile multipartFile){

            String[] allowed = {".jpg", ".jpeg", ".png", ".mp4", ".pdf", ".mp3", ".docs"};

            for(String exrension:allowed){

                if(multipartFile.getOriginalFilename().endsWith(exrension))
                    return true;
            }

            return false;

    }

    public static boolean validateFile(MultipartFile multipartFile){

         long maxSize = 5 * 1024 * 1024;

        if(multipartFile==null || multipartFile.isEmpty()){
            log.error("File is Emply");
            throw new CustomException(HttpStatus.BAD_REQUEST.value(), "File is Empty");
        }else if(multipartFile.getSize()>maxSize){
            log.error("File Size is too large");
            throw new CustomException(HttpStatus.BAD_REQUEST.value(), "File Size is too large");
        }else if(!containsExtension(multipartFile)){
            log.error("unsupported file type");
            throw new CustomException(HttpStatus.BAD_REQUEST.value(), "unsupported file type");
        }

        return true;
    }
    
}

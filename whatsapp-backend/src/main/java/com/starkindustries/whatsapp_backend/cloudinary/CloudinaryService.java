package com.starkindustries.whatsapp_backend.cloudinary;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.starkindustries.whatsapp_backend.exceptions.CustomException;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
@Service
public class CloudinaryService {

    @Autowired
    public CloudinaryConfiguration cloudinaryConfiguration;

        public String uploadToCloudinary(MultipartFile multipartFile){

            if(UploadUtility.validateFile(multipartFile)){
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
            }



        return null;

    }
    
}

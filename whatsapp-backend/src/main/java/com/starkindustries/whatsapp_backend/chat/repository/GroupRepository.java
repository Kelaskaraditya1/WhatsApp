package com.starkindustries.whatsapp_backend.chat.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.starkindustries.whatsapp_backend.chat.model.Group;

public interface GroupRepository extends MongoRepository<Group,String>{
    
}

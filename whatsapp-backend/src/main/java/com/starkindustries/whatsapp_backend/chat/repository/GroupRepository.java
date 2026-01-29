package com.starkindustries.whatsapp_backend.chat.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.starkindustries.whatsapp_backend.chat.model.Group;
import java.util.Optional;


public interface GroupRepository extends MongoRepository<Group,String>{

    public boolean existsByGroupId(String groupId);
    
    public Optional<Group> findByGroupId(String groupId);
    
}

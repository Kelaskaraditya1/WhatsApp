package com.starkindustries.whatsapp_backend.status.repository;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import com.starkindustries.whatsapp_backend.status.model.Status;

@Repository
public interface StatusRepository extends MongoRepository<Status,String>{

    public List<Status> findByUserId(String userId);

     
}

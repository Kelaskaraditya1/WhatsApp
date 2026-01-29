package com.starkindustries.whatsapp_backend.calls.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.starkindustries.whatsapp_backend.calls.model.Call;

@Repository
public interface CallRepository extends MongoRepository<Call,String>{

    public List<Call> findByUserId(String userId);
    
}

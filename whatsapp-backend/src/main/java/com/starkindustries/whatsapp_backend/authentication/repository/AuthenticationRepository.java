package com.starkindustries.whatsapp_backend.authentication.repository;

import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.starkindustries.whatsapp_backend.authentication.enums.AuthType;
import com.starkindustries.whatsapp_backend.authentication.model.Users;

@Repository
public interface AuthenticationRepository extends MongoRepository<Users,String> {
    public boolean existsByUsername(String username);
    public boolean existsByEmail(String email);
    public boolean existsByContact(String contact);

    public Optional<Users> findByUsernameOrEmail(String email,String username);

    public Optional<Users> findByProviderIdAndAuthType(String providerId, AuthType authType);

    public Optional<Users> findByEmail(String email);

}

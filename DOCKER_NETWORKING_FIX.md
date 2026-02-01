# Docker Compose MongoDB Connection Fix - Complete Guide

## ✅ What Was Fixed

### Problem
- Backend was trying to connect to `localhost:27017` instead of the MongoDB service
- In Docker Compose, `localhost` refers to the container itself, not other services
- Services must communicate using **service names** (e.g., `whatsapp-mongodb`)

### Solution
1. **Service Name**: Changed from `mongodb` to `whatsapp-mongodb` for consistency
2. **Connection String**: Updated `DATABASE_URL` to use service name: `whatsapp-mongodb:27017`
3. **Application Properties**: Removed `localhost` fallback, now requires `DATABASE_URL` env var
4. **Dependencies**: Updated `depends_on` to use correct service name

---

## 📋 Step-by-Step Restart & Test Commands

### 1. Stop and Clean Up Existing Containers

```bash
# Stop all services
docker compose down

# Remove containers and networks (keeps volumes)
docker compose down --remove-orphans

# Optional: Remove volumes if you want a fresh start (WARNING: deletes data)
# docker compose down -v
```

### 2. Verify Configuration

```bash
# Check docker-compose.yml syntax
docker compose config

# Verify environment variables are set correctly
docker compose config | grep DATABASE_URL
```

**Expected output should show:**
```
DATABASE_URL=mongodb://admin:password@whatsapp-mongodb:27017/whatsapp?authSource=admin
```

### 3. Start Services

```bash
# Build and start all services
docker compose up -d --build

# Watch logs in real-time
docker compose logs -f

# Watch only backend logs
docker compose logs -f backend
```

### 4. Verify MongoDB is Running

```bash
# Check MongoDB container status
docker compose ps whatsapp-mongodb

# Check MongoDB logs
docker compose logs whatsapp-mongodb

# Test MongoDB connectivity from host
docker compose exec whatsapp-mongodb mongosh --eval "db.adminCommand('ping')"
```

**Expected output:**
```
{ ok: 1 }
```

### 5. Test Network Connectivity from Backend Container

```bash
# Test if backend can reach MongoDB by service name
docker compose exec backend ping -c 3 whatsapp-mongodb

# Test MongoDB port connectivity (requires netcat)
docker compose exec backend sh -c "nc -zv whatsapp-mongodb 27017"

# Alternative: Use telnet if netcat not available
docker compose exec backend sh -c "timeout 3 telnet whatsapp-mongodb 27017 || echo 'Connection test complete'"
```

**Expected output:**
```
whatsapp-mongodb (172.x.x.x:27017) open
```

### 6. Verify Backend Connection

```bash
# Check backend logs for MongoDB connection
docker compose logs backend | grep -i mongo

# Check for connection errors
docker compose logs backend | grep -i "connection\|refused\|error"

# Verify Spring Boot started successfully
docker compose logs backend | grep -i "started\|connected"
```

**Success indicators:**
- ✅ `MongoClient connected to whatsapp-mongodb:27017`
- ✅ `Started WhatsappBackendApplication`
- ❌ No `Connection refused` errors
- ❌ No `localhost:27017` in connection logs

### 7. Test Backend Health Endpoint

```bash
# Test backend health (if actuator is enabled)
curl http://localhost:8080/actuator/health

# Or test any backend endpoint
curl http://localhost:8080/api/health
```

---

## 🔍 Advanced Verification Commands

### Check Docker Network Configuration

```bash
# List all networks
docker network ls

# Inspect the whatsapp-network
docker network inspect whatsapp_whatsapp-network

# Check which containers are on the network
docker network inspect whatsapp_whatsapp-network | grep -A 10 "Containers"
```

### Verify Service DNS Resolution

```bash
# Test DNS resolution from backend container
docker compose exec backend nslookup whatsapp-mongodb

# Or use getent (if available)
docker compose exec backend getent hosts whatsapp-mongodb
```

**Expected output:**
```
whatsapp-mongodb resolves to 172.x.x.x
```

### Check Environment Variables in Backend

```bash
# Print all environment variables
docker compose exec backend env | grep -i mongo

# Specifically check DATABASE_URL
docker compose exec backend env | grep DATABASE_URL
```

**Expected:**
```
DATABASE_URL=mongodb://admin:password@whatsapp-mongodb:27017/whatsapp?authSource=admin
```

### Monitor Real-Time Connection Attempts

```bash
# Watch backend logs in real-time
docker compose logs -f backend

# In another terminal, watch MongoDB logs
docker compose logs -f whatsapp-mongodb
```

---

## 🐛 Troubleshooting Guide

### Issue 1: Still Getting "Connection Refused"

**Symptoms:**
```
com.mongodb.MongoSocketOpenException: Exception opening socket
Caused by: java.net.ConnectException: Connection refused
```

**Solutions:**

1. **Verify service name matches:**
   ```bash
   docker compose config | grep -A 5 "whatsapp-mongodb:"
   ```

2. **Check if MongoDB is healthy:**
   ```bash
   docker compose ps whatsapp-mongodb
   # Should show "healthy" status
   ```

3. **Verify network connectivity:**
   ```bash
   docker compose exec backend ping whatsapp-mongodb
   ```

4. **Check if DATABASE_URL is set correctly:**
   ```bash
   docker compose exec backend env | grep DATABASE_URL
   ```

5. **Restart services:**
   ```bash
   docker compose restart backend
   ```

### Issue 2: Backend Starts Before MongoDB is Ready

**Symptoms:**
- Backend fails to connect on first startup
- Works after manual restart

**Solution:**
The `depends_on` with `condition: service_healthy` should handle this. Verify:

```bash
# Check healthcheck status
docker compose ps

# All services should show "healthy" before backend starts
```

### Issue 3: Authentication Errors

**Symptoms:**
```
Authentication failed
```

**Solutions:**

1. **Verify credentials match:**
   ```bash
   # Check MongoDB environment
   docker compose exec whatsapp-mongodb env | grep MONGO
   
   # Check backend DATABASE_URL
   docker compose exec backend env | grep DATABASE_URL
   ```

2. **Test authentication manually:**
   ```bash
   docker compose exec whatsapp-mongodb mongosh -u admin -p password --authenticationDatabase admin
   ```

### Issue 4: Network Not Found

**Symptoms:**
```
network whatsapp_whatsapp-network not found
```

**Solution:**
```bash
# Recreate network
docker compose down
docker compose up -d
```

### Issue 5: Port Already in Use

**Symptoms:**
```
Bind for 0.0.0.0:27017 failed: port is already allocated
```

**Solution:**
```bash
# Find what's using the port
netstat -ano | findstr :27017  # Windows
lsof -i :27017                 # Linux/Mac

# Or change the port in docker-compose.yml
# ports:
#   - "27018:27017"  # Use different host port
```

---

## ✅ Success Checklist

After following the steps above, verify:

- [ ] `docker compose ps` shows all services as "healthy"
- [ ] `docker compose logs backend` shows successful MongoDB connection
- [ ] No "Connection refused" errors in backend logs
- [ ] `docker compose exec backend nc -zv whatsapp-mongodb 27017` succeeds
- [ ] Backend health endpoint responds (if available)
- [ ] MongoDB logs show connections from backend IP (not just 127.0.0.1)

---

## 📝 Key Takeaways

1. **Never use `localhost` in Docker Compose** - use service names
2. **Service name = DNS hostname** - Docker Compose creates DNS entries
3. **Container name ≠ Service name** - Use service name for networking
4. **Environment variables override** - `DATABASE_URL` in docker-compose.yml overrides .env
5. **Healthchecks ensure readiness** - `depends_on` with `condition: service_healthy` waits

---

## 🔗 Quick Reference

**Service Name:** `whatsapp-mongodb`  
**Container Name:** `whatsapp-mongodb`  
**Network:** `whatsapp-network`  
**Connection String:** `mongodb://admin:password@whatsapp-mongodb:27017/whatsapp?authSource=admin`  
**Port Mapping:** `27017:27017` (host:container)

---

## 📞 Still Having Issues?

1. **Check all logs:**
   ```bash
   docker compose logs > all-logs.txt
   ```

2. **Verify configuration:**
   ```bash
   docker compose config > docker-compose-resolved.yml
   ```

3. **Test minimal setup:**
   ```bash
   # Start only MongoDB and Backend
   docker compose up -d whatsapp-mongodb backend
   docker compose logs -f backend
   ```

4. **Check MongoDB connection from host:**
   ```bash
   # If MongoDB port is exposed, test from host
   mongosh "mongodb://admin:password@localhost:27017/whatsapp?authSource=admin"
   ```

// MongoDB initialization script
// Creates the whatsapp database and sets up initial configurations

db = db.getSiblingDB('whatsapp');

// Create collections with basic indexes
db.createCollection('users');
db.createCollection('messages');
db.createCollection('groups');
db.createCollection('calls');
db.createCollection('status');

// Create indexes for better query performance
db.users.createIndex({ "userId": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "phoneNo": 1 }, { sparse: true });

db.messages.createIndex({ "chatRoomId": 1 });
db.messages.createIndex({ "senderId": 1 });
db.messages.createIndex({ "createdAt": -1 });

db.groups.createIndex({ "groupId": 1 }, { unique: true });

db.calls.createIndex({ "userId": 1 });
db.calls.createIndex({ "timeStamp": -1 });

db.status.createIndex({ "userId": 1 });
db.status.createIndex({ "createdAt": -1 });

print('MongoDB initialization completed successfully!');

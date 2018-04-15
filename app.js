const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const url = 'mongodb://localhost:27017';
const dbName = 'chat';
 

app.use ('/', express.static(path.join(`${__dirname}/public`)));

app.get ('/', (req, res) => {
  res.sendfile('./index.html');
});

const insertDocuments = (db,pseudo,message,callback)=> {
      // Get the documents collection
      const collection = db.collection('message');
      // Insert some documents
      collection.insert([
        {pseudo : pseudo, message : message,}
      ], function(err, result) {
        assert.equal(err, null);
        assert.equal(1, result.result.n);
        assert.equal(1, result.ops.length);
        console.log("message insert");
        callback(result);
      });
};

const findCollection = function(db, callback) {
  // Get the documents collection
  const collection = db.collection('message');
  // Find some documents
  collection.find({}).toArray(function(err, docs) {
    assert.equal(err, null);
    console.log("Found the following records");
    callback(docs);
    return docs;
  });
};

const dropCollection = function(db, callback) {
  // Get the documents collection
  const collection = db.collection('message');
  
  findCollection(db, function(result){
        if(result.length != 0){
          console.log(result+'ici');
          collection.drop(function(err, result) {
            assert.equal(err, null);
            console.log("Removed all the collection");
            callback(result);
          });
        }else{
          console.log('collection is empty');
        }
  }); 
};

io.sockets.on('connection', socket => {
  
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    const db = client.db(dbName);

    socket.on('restore', pseudo => {
      socket.pseudo = pseudo;
      
      findCollection(db, function(result){
        socket.emit('restore', {'pseudo':pseudo, 'message': result});
      });
    });
    
    socket.on('deleteStore',()=> {  
      dropCollection(db, function() {});
      socket.emit('deleteStore');
      socket.broadcast.emit('refresch');
    });
    
    socket.on('newUser', pseudo => {
      socket.pseudo = pseudo;
      let message =`${pseudo} a rejoint le Chat !`;
      
      insertDocuments( db, pseudo, message, function(){});
      socket.broadcast.emit('newUser', pseudo);
    });

    socket.on('message', message => {
      socket.broadcast.emit('message', {'pseudo': socket.pseudo, 'message': message});
      insertDocuments( db, socket.pseudo, message, function(){});
    });
  });
});

server.listen(8080);

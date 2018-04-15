const io = require('socket.io-client');
const socket = io.connect('http://localhost:8080');

const elZoneChat = document.querySelector('#zone_chat');
const elMessage = document.querySelector('#message');
const elPseudo = document.querySelector('#user');
const elBtnClear = document.querySelector('#btnClear');btnClear
let pseudo='';

document.querySelector('#chat').style.visibility = 'hidden';
//elBtnClear.style.visibility = 'hidden';
//elBtnClear.style.visibility = '';


elBtnClear.addEventListener ('click', e => {
   socket.emit('deleteStore');
});

elPseudo.addEventListener ('keypress', e => {
  if (e.keyCode === 13) {
    pseudo = document.querySelector('#user').value;

    if (pseudo.length > 0) {
      document.querySelector('#chat').style.visibility = '';
      document.querySelector('#login').style.visibility = 'hidden';

      socket.emit('newUser', pseudo);
      socket.emit('restore', pseudo);
      document.title = `${pseudo} - ${document.title}`;
      elMessage.focus();
    }
  }
});
pseudo = document.querySelector('#user').value;

/**
   * insereMessage
   * @return {node} elZoneChat
*/
const insereMessage = (pseudo, message) => {
  const msgContent = document.createTextNode (message);
  const msgPseudo = document.createTextNode(`${pseudo}  : `);
  const elNewDiv = document.createElement('div');
  const elNewB = document.createElement('b');

  elZoneChat.appendChild(elNewDiv);
  elNewDiv.appendChild(elNewB);
  elNewB.appendChild(msgPseudo);
  elNewDiv.appendChild(msgContent);
  elZoneChat.scrollTop = elZoneChat.scrollHeight;
};

const restoreMessage = (message) => {
   let msgContent='';
   let msgPseudo='';
  
  message.forEach(function(e) {
    msgContent = document.createTextNode(e.message);
    msgPseudo = document.createTextNode(`${e.pseudo}  : `);
    
    const elNewDiv = document.createElement('div');
    const elNewB = document.createElement('b');

    elZoneChat.appendChild(elNewDiv);
    elNewDiv.appendChild(elNewB);
    elNewB.appendChild(msgPseudo);
    elNewDiv.appendChild(msgContent);
    elZoneChat.scrollTop = elZoneChat.scrollHeight;
  });
};

// receive a normal message
socket.on('message', data => {
  insereMessage(data.pseudo, data.message);
});

socket.on('restore', data=> {
  restoreMessage(data.message);
});
socket.on('deleteStore', ()=> {
  elZoneChat.innerHTML = ""
});
socket.on('refresch', ()=> {
  elZoneChat.innerHTML = ""
});

// send a new user log
socket.on('newUser', data=> {
  
  const pseudo = document.createTextNode(`${data} : `);
  const message = document.createTextNode('a rejoint le Chat !');
  const elNewB = document.createElement('b');
  const elNewDiv = document.createElement('div');
  
  elZoneChat.appendChild(elNewDiv);
  elNewDiv.appendChild(elNewB);
  elNewB.appendChild(pseudo);
  elNewDiv.appendChild(message);
  elZoneChat.scrollTop = elZoneChat.scrollHeight;
});

elMessage.addEventListener ('keypress', e => {
  if (e.keyCode === 13) {
    let message = elMessage.value; 
    
    socket.emit('message', message);// send a normal message in other user  
    insereMessage(pseudo, message); // display a msg in our page
    elMessage.value = ''; // reset an area
    elMessage.focus(); // focus on a message area
  }
});

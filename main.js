var regbtn = document.querySelector('.registration .login-card__button');
var loginbtn = document.querySelector('.login .login-card__button');
var logoutbtn = document.querySelector('.logout');
var goToReg = document.querySelector('.GoToReg');
var loginPage = document.querySelector('.login');
var registrPage = document.querySelector('.registration');
var chatPage = document.querySelector('.chat');
var onlineList = document.querySelector('.online ul');
var messages = document.querySelector('#chat .mess-area');

regbtn.addEventListener('click', registration);
loginbtn.addEventListener('click', logIn);
logoutbtn.addEventListener('click', logOut);
goToReg.addEventListener('click', goRegFunc);


// выводим месаги при каждом пуше в базу
firebase.database().ref().child('messages').on('value', function(snap) {
  if (snap.val() !== null) {
    messages.innerHTML = '';
    var messagesdb = snap.val();
    var keys = Object.keys(snap.val());
    for(var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (messagesdb[k].id === firebase.auth().currentUser.uid) {
        var item = `<div class="user-message self" data-id="3">
        <div class="messages">
        <div class="message">
        <span>${messagesdb[k].name}</span>
        <div class="message-body">${messagesdb[k].text}</div>
        <div class="message-footer">
        <span class="datetime">${messagesdb[k].date}</span>
        </div>
        </div>
        </div>
        </div>`;
      } else {
        var item = `<div class="user-message" data-id="3">
        <div class="messages">
        <div class="message">
        <span>${messagesdb[k].name}</span>
        <div class="message-body">${messagesdb[k].text}</div>
        <div class="message-footer">
        <span class="datetime">${messagesdb[k].date}</span>
        </div>
        </div>
        </div>
        </div>`;
      }
      
      messages.innerHTML += item;
      messages.scrollTop = messages.scrollHeight;
    };
  };
});


// выводим пользователей онлайн
firebase.database().ref().child('online-users').on('value', function(snap) {
  if (snap.val() !== null) {
    onlineList.innerHTML = '';
    var user = snap.val();
    var keys = Object.keys(snap.val());
    for(var i = 0; i < keys.length; i++) {
      var k = keys[i];
      var item = `<li> ${user[k].username} </li>`;
      onlineList.innerHTML += item;
    };
  };
});


function goRegFunc() {
  loginPage.style.display = 'none';
  registrPage.style.display = 'block';
  chatPage.style.display = 'none';
};

function logIn() {
  var email = document.querySelector('.login #login').value;
  var pass = document.querySelector('.login #pass').value;

  firebase.database().ref().child('users').on('value', function(snap) {
    var users = snap.val();
    var keys = Object.keys(snap.val());
    for(var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (email == users[k].email) {

        firebase.auth().signInWithEmailAndPassword(email, pass).catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // ...
          if (errorCode == 'auth/weak-password') {
            alert('The password is too weak.');
          } else {
            alert(errorMessage);
          }
        });
      };
    };
});


}




var newUserId = null;
var newId = null;

function registration() {
    var displayName = document.querySelector('.registration #displayname').value;
    var email = document.querySelector('.registration #email').value;
    var password = document.querySelector('.registration #pass').value;

    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      if (errorCode == 'auth/weak-password') {
        alert('The password is too weak.');
      } else {
        alert(errorMessage);
      }
      console.log(error);
    });

var interval = setInterval(function() {
  console.log('тик');
  var user = firebase.auth().currentUser;
  if (user) {
    clearInterval(interval);
    var uid = user.uid;
    writeUserData(email, password, displayName, uid);
    function writeUserData(email, pass, name, uid) {
      var way = firebase.database().ref('users');
      var newUser = {
        username: name,
        email: email,
        password : pass,
        uid : uid
      };
      way.push(newUser);
    };
  };
});

};



firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      console.log('user loginned');
      writeUserData();
      writeToDBOnline();
      loginPage.style.display = 'none';
      registrPage.style.display = 'none';
      chatPage.style.display = 'flex';
      
      

    } else {
      console.log('user unloggined');
      if (localStorage.getItem('uid')!== null) {
        removeDBOnline();
      };
      loginPage.style.display = 'block';
      registrPage.style.display = 'none';
      chatPage.style.display = 'none';

    }
});

// window.onbeforeunload = function(){
//   logOut();
// }

// window.addEventListener("beforeunload", function(e){
//   logOut();
// }, false);

function logOut() {
  firebase.auth().signOut().then(function() {
      // Sign-out successful.
    }, function(error) {
      // An error happened.
    });
};

function writeToDBOnline() {
  firebase.database().ref().child('users').on('value', function(snap) {
    var users = snap.val();
    var keys = Object.keys(snap.val());
    for(var i = 0; i < keys.length; i++) {
        var k = keys[i];
        if (users[k].uid == firebase.auth().currentUser.uid) {
          firebase.database().ref('online-users/'+ firebase.auth().currentUser.uid +'').set({
            username: users[k].username,
            email: users[k].email
          });
        };
    };
  });
  localStorage.setItem('uid', firebase.auth().currentUser.uid);
};

function removeDBOnline() {
  var uid = localStorage.getItem('uid');
  localStorage.removeItem('uid');
  firebase.database().ref().child('online-users').child(uid).remove()

};

function writeUserData() {
  var user = firebase.auth().currentUser;

firebase.database().ref().child('users').on('value', function(snap) {
    var users = snap.val();
    var keys = Object.keys(snap.val());
    for(var i = 0; i < keys.length; i++) {
        var k = keys[i];
        if (users[k].uid == user.uid) {
          // alert(users[k].username);
        };

    };
});
};

//chat
// var message = `<div class="user-message" data-id="1">
// <div class="messages">
//   <div class="message">
//     <div class="message-body">hey john, do not you wanna tell us about your date last night??? rs</div>
//     <div class="message-footer">
//       <span class="datetime">16:18</span>
//     </div>
//   </div>
// </div>
// </div>`;
var mess = document.querySelector('#toSend input');
var send = document.querySelector('#toSend svg');
document.addEventListener('keypress', function(e) {
  if (e.keyCode == 13) {
    runMess();
  }
});

send.addEventListener('click', runMess);

function runMess() {
  var messVal = document.querySelector('#toSend input').value;

  // var selfMessage = `<div class="user-message self" data-id="3">
  // <div class="messages">
  // <div class="message">
  // <div class="message-body">${mess}</div>
  // <div class="message-footer">
  // <span class="datetime">data</span>
  // </div>
  // </div>
  // </div>
  // </div>`;
  var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();
var hours = today.getHours();
var min = today.getMinutes();

// dd + '/' + mm + '/' + yyyy + '
today = hours +':'+ min;
var pushName = null;
 firebase.database().ref().child('online-users').child(firebase.auth().currentUser.uid).on('value', function(snap) {
    var user = snap.val();
    pushName = user.username;
  });


          firebase.database().ref('messages').push({
            text : messVal,
            id: firebase.auth().currentUser.uid,
            date : today,
            name : pushName
            
          });

  mess.value = '';
  // messages.innerHTML += selfMessage;

};

const Pusher = require('pusher');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const pusher = new Pusher({
  appId: '472959',
  key: '854ddae294ca2e053cf6',
  secret: '8136ec53f77f9b8be4f9',
  authEndpoint: 'localhost:5000/pusher/auth',
  cluster: 'ap2',
  encrypted: true
});

app.set('PORT', process.env.PORT || 5000);	

var getUsers = function(){
  
  var payload;
  pusher.get({ path: '/channels/presence-info/users', params: {} },
  function(error, request, response) {
    if(response.statusCode === 200) {
      var result = JSON.parse(response.body);
      var users = result.users;
      payload = users;
    }else{
      console.log("Can't get online user detail!!");
    }
  });

  return payload;
}

var userId=0;
app.post('/message', (req, res) => {
  const payload = req.body;
  pusher.trigger('chat', 'message', payload);   
  console.log("POST",userId);
  res.send(payload)
});

app.post('/pusher/auth', function(req, res) {
  var socketId = req.body.socket_id;
  var channel = req.body.channel_name;
  var presenceData = {
    user_id: userId,
    user_info: {
      name: req.body.username,
    }
  };

  var allUsers = getUsers();

  var auth = pusher.authenticate(socketId, channel, presenceData);
  console.log("authenticated");
  userId+=1;
  res.send(auth);
});

app.post('/', function(req,res){
  
  payload = getUsers();
  pusher.trigger('onlineUsers', 'change', payload);
  console.log('webhook worked');
  res.status(200);
  res.send('Successfull');

});

app.listen(app.get('PORT'), () => 
  console.log('Listening at ' + app.get('PORT')))




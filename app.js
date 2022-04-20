
var express = require("express");
var request = require("request");
require('dotenv').config();


var bodyParser = require("body-parser");

var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 5000));

app.use(express.static("./utils"));
const databaseActions = require("./utils/database");

// Server index page
app.get("/", function (req, res) {
  res.send("Deployed!");
});

// Facebook Webhook
// Used for verification
app.get("/webhook", function (req, res) {
  if (req.query["hub.verify_token"] === process.env.VERIFICATION_TOKEN) {
    console.log("Verified webhook");
    res.status(200).send(req.query["hub.challenge"]);
  } else {
    console.error("Verification failed. The tokens do not match.");
    res.sendStatus(403);
  }
});


// All callbacks for Messenger will be POST-ed here
app.post("/webhook", function (req, res) {
  // Make sure this is a page subscription
  if (req.body.object == "page") {
    // Iterate over each entry
    // There may be multiple entries if batched
    req.body.entry.forEach(function(entry) {
      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        check_if_player_is_new(event);
      });
    });

    res.sendStatus(200);
  }
});


function check_if_player_is_new(event) {

  console.log("checks if player is new:  ", event);

  if (!event.message.is_echo) {
    var senderId = event.sender.id;

    databaseActions.getUser(senderId)
      .then(result => {
         
          console.log("GETS USER", result);
          if(result.rowCount === 0){

            databaseActions.createUser(senderId, username)
            .then(result => {
              console.log("CREATED USER", result);
                beginOnBoarding(event);
              }).catch(err => {
              console.log(err);
            });

          } else{
            
            if (event.postback) {
              processPostback(event);
            } else if (event.message) {
              processMessage(event);
            }

          }
        }).catch(err => {
         console.log("DOES NOT GET USER", err);
      });

    } else if (event.message.attachments) {
      let attachment_url = message.attachments[0].payload.url;

      sendMessage(senderId, "Sorry, I don't understand that. I am not so good at recognising images yet");
    }
  
}

function beginOnBoarding(event){

  if (!event.message.is_echo) {
    console.log("receives message:  ", event);
    var message = event.message;
    var senderId = event.sender.id;

    console.log("ONBOARDING " + senderId);
    if (message.text) {

      response = {
        "text": "My name is Aase and I will be your guide through this site specific puzzle game, where you have to discover the building we are in and the items that are left here. Did you know that this building was built in 1894 to house the Public Trustee, a national institution that governed the estate of people deemed unable to govern themselves. Back then that mostly meant orphans and children. You will play as Britta Spyd, a young woman recently widowed who has just appeared on the buildings doorstep in the hopes that she can get access to her money.",
        "attachment": {
          "type": "template",
          "payload": {
            "template_type": "generic",
            "elements": [{
              "title": "Welcome to the Britta Spyd Experience!",
              "subtitle": "Do you wanna play?",
              "image_url": "https://res.cloudinary.com/www-houseofkilling-com/image/upload/v1650453963/Britta%20Spyd/Aase_addvdh.jpg",
              "buttons": [
                {
                  "type": "postback",
                  "title": "Yes!",
                  "payload": "yes_i_wanna_play",
                },
                {
                  "type": "postback",
                  "title": "No!",
                  "payload": "no_i_dont_want_to_play",
                }
              ],
            }]
          }
        }
      }
      sendMessage(senderId, response);
    
  } 

  }

}

function processPostback(event) {
  var senderId = event.sender.id;
  var payload = event.postback.payload;
  if(payload === "yes_i_wanna_play"){
    response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "You play as Britta Spyd",
            "subtitle": "a recently widowed woman in Copenhagen 1894",
            "image_url": "https://res.cloudinary.com/www-houseofkilling-com/image/upload/v1650453964/Britta%20Spyd/IMG_0679_qsa9vr.png",
            "buttons": [
              {
                "type": "postback",
                "title": "Yes!",
                "payload": "yes_i_wanna_play",
              },
              {
                "type": "postback",
                "title": "No!",
                "payload": "no_i_dont_want_to_play",
              }
            ],
          }]
        }
      }
    }
    sendMessage(senderId, response);

  } else if(payload === "no_i_dont_want_to_play"){
    response = {
      "text": "boo u r"
    }
    sendMessage(senderId, response);
  }


}

function processMessage(event) {
  var senderId = event.sender.id;
  var message = event.message;
  var payload = event.postback.payload;

  console.log("IS ALREADY PLAYER, and sends message", message);

}



function sendMessage(sender_psid, response) {
  
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  }); 
}
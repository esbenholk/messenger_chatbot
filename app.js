
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

var ole_id;
var carl_id;
var ludwig_id;
var boerge_id;
var director_id;
var agnes_id;

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

  var senderId = event.sender.id;

  databaseActions.getUser(senderId)
      .then(result => {
         
          console.log("GETS USER", result);
          if(result.rowCount === 0){

            databaseActions.createUser(senderId)
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

    
}

function beginOnBoarding(event){

  if (!event.message.is_echo) {
    console.log("receives message:  ", event);
    var message = event.message;
    var senderId = event.sender.id;

    console.log("ONBOARDING " + senderId);
    if (message.text) {

      response = {
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
        "text": "My name is Aase and I will be your guide through this site specific puzzle game, where you have to discover the building we are in and the items that are left here. Did you know that this building was built in 1894 to house the Public Trustee, a national institution that governed the estate of people deemed unable to govern themselves. Back then that mostly meant orphans and children. "
      }
      sendMessage(senderId, response);
      
      
      response = {
          "attachment": {
            "type": "template",
            "payload": {
              "template_type": "generic",
              "elements": [{
                "title": "You play as Britta Spyd",
                "subtitle": "",
                "image_url": "https://res.cloudinary.com/www-houseofkilling-com/image/upload/v1650453964/Britta%20Spyd/IMG_0679_qsa9vr.png",
                "buttons": [
                  {
                    "type": "postback",
                    "title": "Lets do this",
                    "payload": "lets_do_this",
                  }
                
                ],
              }]
            }
          }
        }

      setTimeout(() => {
          sendMessage(senderId, response);
      }, 1000);

    

  } else if(payload === "no_i_dont_want_to_play"){
      response = {
        "text": "boo u r boring"
      }
      sendMessage(senderId, response);
  } else if(payload === "lets_do_this"){
      response = {
        "text": "you are a recently widowed young woman who has just appeared on the building's doorstep in the hopes that you can get access to your money."
      }

      sendMessage(senderId, response);


      response = {
        "attachment": {
          "type": "template",
          "payload": {
            "template_type": "generic",
            "elements": [{
              "title": "Wanna learn how to play?",
              "subtitle": "",
              "image_url": "https://res.cloudinary.com/www-houseofkilling-com/image/upload/v1650453963/Britta%20Spyd/Aase_addvdh.jpg",
              "buttons": [
                {
                  "type": "postback",
                  "title": "teach me the ways of the Public Trustee",
                  "payload": "teach_me",
                }
              
              ],
            }]
          }
        }
      }

    setTimeout(() => {
        sendMessage(senderId, response);
    }, 1000);
    } else if(payload === "teach_me"){
      response = {
        "text": "your money is being kept by the Public Trustee. You must find the directors office and convince him to hand you your cash, but be careful! Its not easy being a single woman in 1894: you must interact with people, locate rooms and find the right items in order to get the director to give you what is yours"
      }
      sendMessage(senderId, response);
      response = {
        "text": "Each room has a code that you can text me, and then I will tell who or what is happening in there and what you might be able to do!"
      }
      setTimeout(() => {
        sendMessage(senderId, response);
      }, 1000);


      sendMessage(senderId, response);
      response = {
        "text": "all I can say right now is that us girls must stick together! Can you see the mosaic window? thats my friend Agnes who is making that"
      }
      setTimeout(() => {
        sendMessage(senderId, response);
      }, 3000);
    }
    


}

function processMessage(event) {
  var senderId = event.sender.id;
  var message = event.message;

  if(message.contains("agnes")){
    
      console.log("IS ALREADY PLAYER, and sends message", message);
      response = {
        "text": "hej you are already playing"
      }
      sendMessage(senderId, response);

  } else if(message.contains("reception")){
    
    response = {
      "text": "Welcome to the Public Trustee. As the Danish Government doesn't allow lone women to own any wealth, we offer to help widows like yourself to regain ownership over their belongings. All you have to do is pick up a form and bring it to the Director's office. If you're not ready, you can come back later with more information by simply typing reception. Enjoy your visit!"
    }
    sendMessage(senderId, response);

    sendMessage(senderId, response);
    response = {
      "text": "PS.: Please be aware that there might be some inconveniences as we hired an artist to design our window on the main staircase."
    }
    setTimeout(() => {
      sendMessage(senderId, response);
    }, 3000);

  } else if(message.contains("director")){
    console.log("goes to the director");

  } else if(message.contains("atelier")){
    response = {
      "text": "you are standing in the atelier. This is a place to wait and maybe meet a stranger. Oh! look at that: Ole is here. Lets chat with him"
    }
    sendMessage(senderId, response);

    databaseActions.setCurrentCharacter("Ole", senderId)
    .then(result => {
       
      response = {
        "attachment": {
          "type": "template",
          "payload": {
            "template_type": "generic",
            "elements": [{
              "title": "Lets talk to Ole",
              "subtitle": "",
              "image_url": "https://res.cloudinary.com/www-houseofkilling-com/image/upload/v1650453963/Britta%20Spyd/IMG_0179_xlxllt.jpg",
              "buttons": [
                {
                  "type": "postback",
                  "title": "Talk",
                  "payload": "talk_to_man",
                },
                {
                  "type": "postback",
                  "title": "Ask him about someone",
                  "payload": "ask_man_about_someone",
                },
                {
                  "type": "postback",
                  "title": "Ask him to help you",
                  "payload": "ask_man_help",
                }
              
              ],
            }]
          }
        }
      }
  
      setTimeout(() => {
          sendMessage(senderId, response);
      }, 1000);

      
      }).catch(err => {
       console.log("DOES NOT GET USER", err);
    });


    
  }



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




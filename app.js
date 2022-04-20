
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
        if (event.postback) {
          processPostback(event);
        } else if (event.message) {
          processMessage(event);
        }
      });
    });

    res.sendStatus(200);
  }
});


function processMessage(event) {


  if (!event.message.is_echo) {
    console.log("receives message:  ", event.message);
    var message = event.message;
    var senderId = event.sender.id;
    var username = event.sender.username;
    var isAlreadyUser = false;

    databaseActions.getUser(senderId)
      .then(result => {
         
          console.log("GETS USER", result);
          
          if(!result){
            databaseActions.createUser(senderId, username)
            .then(result => {
                console.log("CREATED USER", result);
              }).catch(err => {
               console.log(err);
            });
          }
        }).catch(err => {
         console.log("DOES NOT GET USER", err);
      });


    console.log("Received message from senderId: " + senderId);
    console.log("Message is: " + JSON.stringify(message));

    // You may get a text or attachment but not both
    if (message.text) {
      var formattedMsg = message.text.toLowerCase().trim();
      if(formattedMsg === "hej"){

        response = {
          "attachment": {
            "type": "template",
            "payload": {
              "template_type": "generic",
              "elements": [{
                "title": "I found this image of you",
                "subtitle": "Do you recognise yourself?",
                "image_url": "https://res.cloudinary.com/www-houseofkilling-com/image/upload/v1649845465/Britta%20Spyd/image_efzzgz.png",
                "buttons": [
                  {
                    "type": "postback",
                    "title": "Yes!",
                    "payload": "yes",
                  },
                  {
                    "type": "postback",
                    "title": "No!",
                    "payload": "no",
                  }
                ],
              }]
            }
          }
        }
        sendMessage(senderId, response);
      }


    } else if (message.attachments) {
      let attachment_url = message.attachments[0].payload.url;

      sendMessage(senderId, "Sorry, I don't understand your request.");
    }
  }
}

function processPostback(event) {
  var senderId = event.sender.id;
  var payload = event.postback.payload;




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
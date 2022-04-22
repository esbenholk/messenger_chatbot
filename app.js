
const express = require('express')
const request = require('request')
require('dotenv').config()

const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.listen((process.env.PORT || 5000))

app.use(express.static('./utils'))
const databaseActions = require('./utils/database')
const { truncate } = require('fs')

let current_character;
let current_space;
// Server index page
app.get('/', function (req, res) {
  res.send('Deployed!')
})

// Facebook Webhook
// Used for verification
app.get('/webhook', function (req, res) {
  if (req.query['hub.verify_token'] === process.env.VERIFICATION_TOKEN) {
    console.log('Verified webhook')
    res.status(200).send(req.query['hub.challenge'])
  } else {
    console.error('Verification failed. The tokens do not match.')
    res.sendStatus(403)
  }
})

// All callbacks for Messenger will be POST-ed here
app.post('/webhook', function (req, res) {
  // Make sure this is a page subscription
  if (req.body.object == 'page') {
    // Iterate over each entry
    // There may be multiple entries if batched
    req.body.entry.forEach(function (entry) {
      // Iterate over each messaging event
      entry.messaging.forEach(function (event) {
        check_if_player_is_new(event)
      })
    })

    res.sendStatus(200)
  }
})

// databaseActions.getUser(senderId)
// .then(result => {
//   console.log("secccus", err);

//   }).catch(err => {
//    console.log("fail", err);
// });


async function set_current_space(space, id){

  databaseActions.setCurrentSpace(space, id)
  .then(result => {

    const resultObj = result.rows[0]

    if (resultObj[Object.keys(resultObj)[0]] != null) {
        current_space = resultObj[Object.keys(resultObj)[0]];
        return current_space;
    }

  }).catch(()=>{
    return false;
  })
}


async function get_current_space(id){

    await databaseActions.getCurrentSpace(id)
    .then(result => {
      const resultObj = result.rows[0]

      if (resultObj[Object.keys(resultObj)[0]] != null) {
          current_space = resultObj[Object.keys(resultObj)[0]];
          return current_space;
      } else{
        return null;
      }
     
  
  }).catch(()=>{})
}

async function have_you_interacted_before(interaction, id){

  await databaseActions.getInteraction(interaction, id)
  .then(result => {
    const resultObj = result.rows[0]

    if (resultObj[Object.keys(resultObj)[0]] != null) {
        return true;
    } else{
      return false;
    }

}).catch(()=>{})
}

function check_if_player_is_new (event) {
  const senderId = event.sender.id

  console.log('CHECKSSSSS EVENT!!!!!', senderId)

  databaseActions.getUser(senderId)
    .then(result => {
      console.log('CHECK FOR USER', result)
      if (result.rowCount === 0) {
        console.log('CREATES USER', senderId)
        databaseActions.createUser(senderId)
          .then(result => {
            console.log('CREATED USER', result)
            beginOnBoarding(event)
          }).catch(err => {
            console.log(err)
          })
      } else {
        databaseActions.getCurrentCharacter(senderId)
          .then(result => {
            current_character = result.rows[0].current_character
            console.log('CURRENT CHARACTER', current_character)

            if (event.postback) {
              processPostback(event)
            } else if (event.message && !event.message.is_echo) {
              processMessage(event)
            }
          }).catch(err => {
            console.log('NO CURRENT CHARACTER', err)
          })
      }
    }).catch(err => {
      console.log('DOES NOT GET USER', err)
    })
}

function beginOnBoarding (event) {
  console.log('receives message:  ', event)
  const message = event.message
  const senderId = event.sender.id

  console.log('ONBOARDING ' + senderId)
  if (message.text) {
    response = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [{
            title: 'Welcome to the Britta Spyd Experience!',
            subtitle: 'Do you wanna play?',
            image_url: 'https://res.cloudinary.com/www-houseofkilling-com/image/upload/v1650453962/Britta%20Spyd/aase3_gr6xfs.jpg',
            buttons: [
              {
                type: 'postback',
                title: 'Yes!',
                payload: 'yes_i_wanna_play'
              },
              {
                type: 'postback',
                title: 'No!',
                payload: 'no_i_dont_want_to_play'
              }
            ]
          }]
        }
      }
    }
    sendMessage(senderId, response)
  }
}

function processPostback (event) {
  const senderId = event.sender.id
  const payload = event.postback.payload


  /////////consent to play
  if (payload === 'yes_i_wanna_play') {
    let response = {
      text: 'My name is Aase and I will be your guide through this site specific puzzle game, where you have to discover the building we are in and the items that are left here. Did you know that this building was built in 1894 to house the Public Trustee, a national institution that governed the estate of people deemed unable to govern themselves. Back then that mostly meant orphans and children. '
    }
    sendMessage(senderId, response).then(res=>{
      response = {
        attachment: {
                type: 'template',
                payload: {
                template_type: 'generic',
                elements: [{
                title: 'You play as Britta Spyd',
                subtitle: '',
                image_url: 'https://res.cloudinary.com/www-houseofkilling-com/image/upload/v1650453964/Britta%20Spyd/IMG_0679_qsa9vr.png',
                buttons: [
                  {
                    type: 'postback',
                    title: 'Lets do this',
                    payload: 'lets_do_this'
                }
              ]
            }]
          }
        }
      }
      setTimeout(() => {
        sendMessage(senderId, response)
      }, 1000);

    });

  /////////dont wanna play
  } else if (payload === 'no_i_dont_want_to_play') {
    response = {
      text: 'boo u r boring'
    }
    sendMessage(senderId, response)

  //////consent to play as BRITTA
  } else if (payload === 'lets_do_this') {
    response = {
      text: "you are a recently widowed young woman who has just appeared on the building's doorstep in the hopes that you can get access to your money."
    }

    sendMessage(senderId, response).then(res=>{

      response = {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: [{
              title: 'Wanna learn how to play?',
              subtitle: '',
              image_url: 'https://res.cloudinary.com/www-houseofkilling-com/image/upload/v1650453964/Britta%20Spyd/IMG_0679_qsa9vr.png',
              buttons: [
                {
                  type: 'postback',
                  title: 'teach me',
                  payload: 'teach_me'
                }
  
              ]
            }]
          }
        }
      }
  
      setTimeout(() => {
        sendMessage(senderId, response)
      }, 1000)

    })


  } else if (payload === 'teach_me') {
    response = {
      text: 'your money is being kept by the Public Trustee. You must find the directors office and convince him to hand you your cash, but be careful! Its not easy being a single woman in 1894: you must interact with people, locate rooms and find the right items in order to get the director to give you what is yours'
    }


    sendMessage(senderId, response).then(res=>{
      response = {
        text: 'Each room has a code that you can text me, and then I will tell who or what is happening in there and what you might be able to do!'
      }

      setTimeout(() => {

        sendMessage(senderId, response).then(res=>{

          response2 = {
            text: 'lets try it out! try finding the reception and typing in the room code "reception"'
          }
          setTimeout(() => {
            sendMessage(senderId, response2)
          }, 3000)

        })
      }, 1000)
    })



  } else if (payload === 'ask_man_about_someone') {
    console.log('ASKS ABOUT MEN', current_character)

    const men = ['carl', 'ole', 'boerge', 'ludwig']
    let sortedmen = []
    const buttons = []
    if (current_character != null) {
      sortedmen = men.filter((value) => value !== current_character.toLowerCase())
    }
    console.log('CHECKS OTHER MEN', sortedmen)

    for (let index = 0; index < sortedmen.length; index++) {
      const man = sortedmen[index]

      databaseActions.getDynamicMan(man, senderId)
        .then(result => {
          const resultObj = result.rows[0]
          console.log(`has user met ${man}?`, resultObj[Object.keys(resultObj)[0]])

          if (resultObj[Object.keys(resultObj)[0]] != null) {
            buttons.push({ type: 'postback', title: `tell me about ${man}`, payload: `tell_me_about_${man}` })
            console.log('pushes button into array,', man)
          }

          if (index >= 2) {
            sendMessageWithCustomButtons()
          }
        }).catch(err => {
          console.log('FAILS AT ASKING ABOUT MEN')
        })
    }

    function sendMessageWithCustomButtons () {
      console.log('sends custom buttons', buttons)
      if (buttons.length > 0) {
        console.log('sends custom buttons with attached buttons')
        response = {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'buttons',
              elements: [{
                title: 'Who do you wanna hear about?',
                buttons
              }]
            }
          }
        }
        setTimeout(() => {
          sendMessage(senderId, response2)
        }, 3000)


      } else {

        console.log('sends error notice instead: meet more men')
        response = {
          text: "Oh you wouldn't know who I was talking about even if I told you. You have to meet a person before you can hear gossip about them, but hej: now you've met me!!!"
        }

        sendMessage(senderId, response)
      }
    }
  }
}

function processMessage (event) {
  const senderId = event.sender.id
  const message = event.message
  const formattedMessage = message.text.toLowerCase().trim().toString()

  if (event.message && !event.message.is_echo) {


    //////AGNES
    if (formattedMessage.includes('agnes')) {

      response = {
        attachment: {
          type: 'image',
          payload: {
            url:"https://res.cloudinary.com/www-houseofkilling-com/image/upload/v1650617513/Britta%20Spyd/Agnes_tcvwes.png", 
            is_reusable:true
          }
        }
      }

      sendMessage(senderId, response).then(res=>{

        if(have_you_interacted_before('agnes', senderId)){

 
          response = {
            text: "Oh Britta! How is it going? I wanted to share you a secret actually: I am pregnant - Maybe you can help me. "
          }
          sendMessage(senderId, response);
  
          response = {
            attachment: {
              type: 'template',
              payload: {
                template_type: 'generic',
                elements: [{
                  title: 'What should I call my daughter?',
                  subtitle: '',
                  image_url: 'https://res.cloudinary.com/www-houseofkilling-com/image/upload/v1650617513/Britta%20Spyd/Agnes_tcvwes.png',
                  buttons: [
                    {
                      type: 'postback',
                      title: 'Benedetta',
                      payload: 'baby_name_benedetta'
                    },
                    {
                      type: 'postback',
                      title: 'Stine',
                      payload: 'baby_name_stine'
                    },
                    {
                      type: 'postback',
                      title: 'Victoria',
                      payload: 'baby_name_victoria'
                    },
      
                  ]
                }]
              }
            }
          }
  
          setTimeout(() => {
            sendMessage(senderId, response2)
          }, 3000)
  
  
        } else{
  
          response = {
            text: "Hello Britta! I'm a big fan of yours! You're an amazing performer! I'm so sorry for the loss of your husband, and now you can't even handle your own money. They will help you here, but watch out: as bad as it can sound, the form is not the only thing you'll need. You have to find a man who is willing to be your companion in the process, or your application will be rejected and you won't get any of your money! I know, it sucks, but maybe you will find someone here. Look around for hints!"
          }
          sendMessage(senderId, response);
          
        }

      });

 



    //////RECEPTION
    } else if (formattedMessage.includes('reception')) {

      set_current_space('reception', senderId);

      if(have_you_interacted_before('reception', senderId)){

        response = {
          text: "Welcome back Britta, are you ready to pick a form to bring with you to the Directors office?"
        }
        sendMessage(senderId, response).then(res=>{

          response = {
            attachment: {
              type: 'template',
              payload: {
                template_type: 'generic',
                elements: [{
                  title: 'Lets talk to Ole',
                  subtitle: '',
                  image_url: 'https://res.cloudinary.com/www-houseofkilling-com/image/upload/v1650453963/Britta%20Spyd/IMG_0179_xlxllt.jpg',
                  buttons: [
                    {
                      type: 'postback',
                      title: 'Tell me about the forms',
                      payload: 'tell_me_about_forms'
                    },
                    {
                      type: 'postback',
                      title: 'I am ready to take a form',
                      payload: 'ready_to_take_a_form'
                    },
                    {
                      type: 'postback',
                      title: 'I will go investigate some more',
                      payload: 'continue_investigation'
                    }
  
                  ]
                }]
              }
            }
          }
  
          setTimeout(() => {
            sendMessage(senderId, response)
          }, 2000)

        })

      
      } else{

        databaseActions.dynamicSpace('reception', 'has been there', senderId)
        .then(result => {

          response = {
            text: "Welcome to the Public Trustee. As the Danish Government doesn't allow lone women to own any wealth, we offer to help widows like yourself to regain ownership over their belongings. All you have to do is pick up a form and bring it to the Director's office. If you're not ready, you can come back later with more information by simply typing reception. Enjoy your visit!"
          }
          sendMessage(senderId, response).then(res=>{
            response = {
              text: 'PS.: Please be aware that there might be some inconveniences as we hired an artist to design our window on the main staircase.'
            }
            setTimeout(() => {
              sendMessage(senderId, response)
            }, 3000);
  
          })

        }).catch(err => {
          console.log('fail', err)
        })


      }



    //////DIRECTORS OFFICE
    } else if (formattedMessage.includes('director')) {
      response = {
        text: 'you are standing in the Directors office, are you ready to see him?'
      }
      sendMessage(senderId, response)



     //////ATELIER OLE
    } else if (formattedMessage.includes('atelier') || formattedMessage.includes('ole')) {
      response = {
        text: "You are standing in the atelier. It's always a nice place to meet a stranger. Oh! And look at that: Ole is here!"
      }
      sendMessage(senderId, response).then(res=>{

        databaseActions.setCurrentCharacter('Ole', senderId)
        .then(result => {
          databaseActions.dynamicMan('ole', 'has met him', senderId)
            .then(result => {
              console.log('secccus', err)
            }).catch(err => {
              console.log('fail', err)
            })

          response = {
            attachment: {
              type: 'template',
              payload: {
                template_type: 'generic',
                elements: [{
                  title: 'Lets talk to Ole',
                  subtitle: '',
                  image_url: 'https://res.cloudinary.com/www-houseofkilling-com/image/upload/v1650453963/Britta%20Spyd/IMG_0179_xlxllt.jpg',
                  buttons: [
                    {
                      type: 'postback',
                      title: 'Ask Ole about someone',
                      payload: 'ask_man_about_someone'
                    },
                    {
                      type: 'postback',
                      title: 'Ask Ole to help you',
                      payload: 'ask_man_help'
                    },
                    {
                      type: 'postback',
                      title: 'Talk',
                      payload: 'talk_to_man'
                    }

                  ]
                }]
              }
            }
          }

          setTimeout(() => {
            sendMessage(senderId, response)
          }, 1000)
        }).catch(err => {
          console.log('DOES NOT GET USER', err)
        })

      })

   
    }


  }
}

async function sendMessage (sender_psid, response) {
  // Construct the message body
  const request_body = {
    recipient: {
      id: sender_psid
    },
    message: response
  }

  // Send the HTTP request to the Messenger Platform
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: request_body
  }, (err, res, body) => {
    if (!err) {
      return res;
    } else {
      return err;
    }
  })
}

require('dotenv').config();
import request from 'request';

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
console.log('page access token: ', PAGE_ACCESS_TOKEN);
// verify token is random string
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

let getHomePage = (req, res) => {
  return res.send('xin chao');
};

let getWebhook = (req, res) => {
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    }
  } else {
    res.status(403);
  }
};


let postWebhook = (req, res) =>{
  // Parse the request body from the POST
  let body = req.body;

  // Check the webhook event is from a Page subscription
  if (body.object === 'page') {

      // Iterate over each entry - there may be multiple if batched
      body.entry.forEach(function(entry) {

          // Gets the body of the webhook event
          let webhook_event = entry.messaging[0];
          console.log(webhook_event);


          // Get the sender PSID
          let sender_psid = webhook_event.sender.id;
          console.log('Sender PSID: ' + sender_psid);

          // Check if the event is a message or postback and
          // pass the event to the appropriate handler function
          if (webhook_event.message) {
              handleMessage(sender_psid, webhook_event.message);
          } else if (webhook_event.postback) {
              handlePostback(sender_psid, webhook_event.postback);
          }

      });

      // Return a '200 OK' response to all events
      res.status(200).send('EVENT_RECEIVED');

  } else {
      // Return a '404 Not Found' if event is not from a page subscription
      res.sendStatus(404);
  }
};

//handles message events
function handleMessage(sender_psid, received_message) {
  let response;

  // Check nếu nội dung của tin nhắn chưa text thì trả về response
  if (received_message.text) {
    // tạo đoạn text trả về cho người dùng
    response = {
      'text': `Bạn vừa gửi một đoạn text: "${received_message.text}". Giờ hãy gửi cho tôi một bức ảnh! `,
    }

    // gửi response cho người dùng
    callSendAPI(sender_psid, response);
  }
};

//handles message_postbacks events
function handleMessage(sender_psid, received_message) {

};

//send response messages via the send API
function handleMessage(sender_psid, received_message) {

};

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
      "recipient": {
          "id": sender_psid
      },
      "message": { "text": response }
  };
  console.log('request_body: ', request_body);

  // Send the HTTP request to the Messenger Platform
  request({
      "uri": "https://graph.facebook.com/v7.0/me/messages",
      "qs": { "access_token": PAGE_ACCESS_TOKEN },
      "method": "POST",
      "json": request_body
  }, (err, res, body) => {
      if (!err) {
          console.log('message sent!');
      } else {
          console.error("Unable to send message:" + err);
      }
  });
}

module.exports = {
  getHomePage: getHomePage,
  getWebhook: getWebhook,
  postWebhook: postWebhook
};
// curl -X GET "localhost:8080/webhook?hub.verify_token=tranducdat&hub.challenge=CHALLENGE_ACCEPTED&hub.mode=subscribe"

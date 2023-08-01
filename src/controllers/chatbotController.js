require("dotenv").config();
import request from "request";

const FB_PAGE_TOKEN = process.env.FB_PAGE_TOKEN;

let getHomePage = (req, res) => {
  return res.render('homePage.ejs');
};

let postWebhook = (req, res) =>{
    // Parse the request body from the POST
    let body = req.body;

    // Check the webhook event is from a Page subscription
    if (body.object === "page") {

        // Iterate over each entry - there may be multiple if batched
        body.entry.forEach(function(entry) {

            // Gets the body of the webhook event
            let webhook_event = entry.messaging[0];
            console.log("webhook_event: ", webhook_event);
            
            //get sender PSID
            let sender_psid = webhook_event.sender.id;
            console.log("Sender PSID: " + sender_psid);

            //check nếu là message gửi đi hoặc postback(gửi lại) thì sẽ gửi lại thông báo sao cho hợp lý
            if (webhook_event.message) {
              handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
              handlePostback(sender_psid, webhook_event.postback);
            }

        });

        // Return a "200 OK" response to all events
        res.status(200).send("EVENT_RECEIVED");

    } else {
        // Return a "404 Not Found" if event is not from a page subscription
        res.sendStatus(404).send("loi roi");
    }
};

let getWebhook = (req, res) => {

    let VERIFY_TOKEN = process.env.MY_VERIFY_FB_TOKEN;
    // Parse the query params
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {

        // Checks the mode and token sent is correct
        if (mode === "subscribe" && token === VERIFY_TOKEN) {

            // Responds with the challenge token from the request
            console.log("WEBHOOK_VERIFIED");
            res.status(200).send(challenge);

        } else {
            // Responds with "403 Forbidden" if verify tokens do not match
            res.sendStatus(403);
        }
    }
};

//handles message events
function handleMessage(sender_psid, received_message) {
  let response;

  // Check nếu nội dung của tin nhắn chứa text thì trả về response cho người gửi
  if (received_message.text) {
    // tạo đoạn text trả về cho người dùng
    response = {
      "text": `Bạn đã gửi cho tôi một tin nhắn: "${received_message.text}". Giờ hãy gửi cho tôi một bức ảnh!`
    }
  } else if (received_message.attachments) {
    //Get URL của tin nhắn đính kèm
    let attachment_url = received_message.attachments[0].payload.url;
    console.log('attachment url: ' + attachment_url);
    response = {
      "attachment": {
        "type": "template",
        "payload": {
            "template_type": "generic",
            "elements": [
              {
                "title": "Đây có phải bức ảnh của bạn không?",
                "subtitle": "Hãy nói cho tôi biết <3",
                "image_url": attachment_url,
                "buttons": [
                  {
                    "type": "postback",
                    "title": "Đúng!",
                    "payload": "yes",
                  },
                  {
                    "type": "postback",
                    "title": "Sai!",
                    "payload": "no",
                  }
                ],
              }
            ]
          }
        }
    }
  }
  // gửi response cho người dùng
  callSendAPI(sender_psid, response);
};

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body ={
    "recipient": {
      "id": sender_psid,
    },
    "message": response,
  };

  // Send the HTTP request to the Messenger Platform
  request({
      "uri": "https://graph.facebook.com/v7.0/me/messages",
      "qs": { "access_token": FB_PAGE_TOKEN },
      "method": "POST",
      "json": request_body
  }, (err, res, body) => {
      if (!err) {
          console.log("message sent!");
      } else {
          console.error("Unable to send message:" + err);
      }
  });
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
    let response;

    // Get the payload for the postback
    let payload = received_postback.payload;

    // Set the response based on the postback payload
    if (payload === "yes") {
        response = { "text": "Thanks!" }
    } else if (payload === "no") {
        response = { "text": "Xin lỗi, hãy gửi cho tôi một cái ảnh khác" }
    } else if (payload === "hey") {
      response = { "text": "gọi cái gì cư :D" }
    } else if (payload === "GET_STARTED") {
      // xử lý khi người dùng nhấn vào nút get stated
      response = { "text": "Xin chào bạn ABC đã đến với cửa hàng của chúng tôi, chúc bạn mua hàng vui vẻ, iuuuuuu..." }
    }
    // Send the message to acknowledge the postback
    callSendAPI(sender_psid, response);
}

let setupProfile = async (req, res) => {
  //call profile facebook api
  let request_body ={
    "get_started": {"payload": "GET_STARTED"},
    "whitelisted_domains": ["https://chatbot-traotay-intern.onrender.com/"],
  };

  // Send the HTTP request to the Messenger Platform
  await request({
      "uri": `https://graph.facebook.com/v17.0/me/messenger_profile?access_token=${FB_PAGE_TOKEN}`,
      "qs": { "access_token": FB_PAGE_TOKEN },
      "method": "POST",
      "json": request_body
  }, (err, res, body) => {
    console.log('BODY: ', body);
      if (!err) {
          console.log("Setup user profile succeeds!");
      } else {
          console.error("Unable to setup user profile:" + err);
      }
  });

  return res.send("Setup user profile succeeds!");

};

module.exports = {
  postWebhook: postWebhook,
  getWebhook: getWebhook,
  getHomePage: getHomePage,
  setupProfile: setupProfile
};

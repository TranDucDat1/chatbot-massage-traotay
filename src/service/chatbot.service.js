require("dotenv").config();
import request from "request";

const FB_PAGE_TOKEN = process.env.FB_PAGE_TOKEN;

let callSendAPI = (sender_psid, response) => {
  // Construct the message body
  let request_body ={
    "recipient": {
      "id": sender_psid,
    },
    "message": response,
  };

  // Send the HTTP request to the Messenger Platform
  request({
      "uri": "https://graph.facebook.com/v17.0/me/messages",
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
};

let handleGetStarted = (sender_psid) => {
  return Promise( async (resolve, reject) => {
    try {
      let response = { "text": "Xin chào bạn ABC đã đến với cửa hàng của chúng tôi, chúc bạn mua hàng vui vẻ, iuuuuuu... <3" };
      await callSendAPI(sender_psid, response);
      resolve('done');
    } catch (error) {
      reject(error);
    }
  })
};

module.exports = {
  handleGetStarted: handleGetStarted
}
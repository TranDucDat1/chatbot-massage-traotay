require('dotenv').config();

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
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

let postWebhook = (req, res) => {
  let body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(function(entry) {
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);

      //get sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log('Sender PSID: ' + sender_psid);
    });
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.status(404).send('Loi roi')
  }

};

//handles message events
function handleMessage(sender_psid, received_message) {

};

//handles message_postbacks events
function handleMessage(sender_psid, received_message) {

};

//send response messages via the send API
function handleMessage(sender_psid, received_message) {

};

module.exports = {
  getHomePage: getHomePage,
  getWebhook: getWebhook,
  postWebhook: postWebhook
};
// curl -X GET "localhost:8080/webhook?hub.verify_token=tranducdat&hub.challenge=CHALLENGE_ACCEPTED&hub.mode=subscribe"

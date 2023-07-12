import express from "express";

import { getWebhook, postWebhook, getHomePage } from "../controllers/chatbotController";
let router = express.Router();


let initWebRoutes = (app) => {
  router.get('/', getHomePage);
  router.get('/webhook', getWebhook);
  router.post('/webhook', postWebhook);

  return app.use('/', router);
};

module.exports = initWebRoutes;

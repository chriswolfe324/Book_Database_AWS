const express = require('express');
const router = express.Router();
const { InvokeCommand } = require("@aws-sdk/client-lambda");
const { LambdaClient } = require("@aws-sdk/client-lambda");
const lambda = new LambdaClient({ region: "us-east-1" });



router.post('/reading-history', async (req, res) => {
  const functionName = "project_lambda_function";
  const { reportType } = req.body;

  try {
    const command = new InvokeCommand({
      FunctionName: functionName,
      Payload: Buffer.from(JSON.stringify({
        reportType: reportType,
        userId: req.session.userId
      }))
    });

    const response = await lambda.send(command);
    console.log("Lambda status code:", response.StatusCode);

    res.render ('report/status', {
      message: 'Report generation started successfully. Your report will be available shortly.'
    });


  } catch (err) {
    console.error(err);
    res.status(500).send('Error starting report job.');
  }  
});

module.exports = router;
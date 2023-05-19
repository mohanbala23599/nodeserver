const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/notify_url', (req, res) => {
  // Verify the IPN request
  const verificationBody = 'cmd=_notify-validate&' + JSON.stringify(req.body);
  
  // Make a POST request to PayPal's IPN verification endpoint
  const request = require('request');
  const options = {
    url: 'https://www.paypal.com/cgi-bin/webscr',
    method: 'POST',
    headers: {
      'Content-Length': verificationBody.length,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: verificationBody
  };

  request(options, (error, response, body) => {
    if (error || response.statusCode !== 200) {
      // Handle verification failure
      console.error('IPN verification failed:', error);
      res.status(500).end();
      return;
    }

    // Check the response body for the verification result
    if (body === 'VERIFIED') {
      // IPN verified, process the payment
      const paymentStatus = req.body.payment_status;
      const paymentAmount = req.body.mc_gross;
      const transactionId = req.body.txn_id;
      res.send(req.body['invoice'])
      // Process the payment and update your database

      // Return a 200 response to PayPal
      res.status(200).end();
    } else if (body === 'INVALID') {
      // IPN invalid, log for further investigation
      console.error('Invalid IPN:', req.body);
      res.status(400).end();
    } else {
      // Unexpected response, log for further investigation
      console.error('Unexpected response:', body);
      res.status(500).end();
    }
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});

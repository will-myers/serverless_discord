const nacl = require('tweetnacl');
const slashCommandHandler = require('./helpers/slash-command-handler.js');

exports.handler = async (event) => {
  try {
    // Checking signature (requirement 1.)
    // Your public key can be found on your application in the Developer Portal
    const PUBLIC_KEY = process.env.PUBLIC_KEY;
    const signature = event.headers['x-signature-ed25519']
    const timestamp = event.headers['x-signature-timestamp'];
    const strBody = event.body; // should be string, for successful sign

    const isVerified = nacl.sign.detached.verify(
      Buffer.from(timestamp + strBody),
      Buffer.from(signature, 'hex'),
      Buffer.from(PUBLIC_KEY, 'hex')
    );

    if (!isVerified) {
      return {
        statusCode: 401,
        body: JSON.stringify('invalid request signature'),
      };
    }

    const body = JSON.parse(strBody);

    // Replying to ping (requirement 2.)
    if (body.type == 1) {
      return {
        statusCode: 200,
        body: JSON.stringify({ "type": 1 }),
      }
    }

    // Replying to slash command
    if (body.type == 2) {
      try {
        return response = slashCommandHandler(body);
      }
      catch(ex) {
        console.log('Failed to handle slash command!');
        console.log(ex);
        return {
          statusCode: 500,
          body: 'Internal server error',
        };
      }
    }

    console.log('Something went wrong if we got here..');

    return {
      statusCode: 500  // If no handler implemented for Discord's request
    }
  }
  catch (ex) {
    console.log(ex);
    return {
      statusCode: 500,
      body: 'Internal server error',
    };
  }
  
};
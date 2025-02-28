// Download the helper library from https://www.twilio.com/docs/node/install
import twilio from 'twilio';


export const sendWhatsAppToken = async (user, channel) => {

    const client = twilio(process.env.SERVICE_SID, process.env.AUTH_TOKEN);

  const verification = await client.verify.v2
    .services(process.env.SERVICE_SID)
    .verifications.create({
      channel: "whatsapp",
      to: "+2347046433968",
    });

  console.log(verification.accountSid);
}
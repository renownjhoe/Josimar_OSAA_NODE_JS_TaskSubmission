import axios from 'axios';

export const sendTelegramOtp = async (user, channel) =>  {
    axios.post(
    `https://api.telegram.org/${process.env.TELEGRAM_API_KEY}/sendMessage`,
    {
      chat_id: user.phone,
      text: `Your verification code is: ${rawOTP}`
    }
  );
}
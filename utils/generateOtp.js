// Helper function to generate 6-digit OTP
export const generateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // console.log('Generated OTP:', otp); // Debug log
    return otp;
  };
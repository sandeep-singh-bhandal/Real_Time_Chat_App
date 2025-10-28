import SibApiV3Sdk from 'sib-api-v3-sdk';
const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

export const sendOtpEmail = async (email, otp) => {
  const sender = {
    email: "mr.money.bhandal@gmail.com",
    name: "Chatty Admin"
  };

  const receivers = [
    { email: email }
  ];

  try {
    await tranEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject: "Email Verification Code",
      textContent: `Your email verification code is ${otp}.\nUse this to verify your email, the code is valid for 15 minutes only.`,
    });
    return true
  } catch (error) {
    console.error("Failed to send OTP:", error);
    return false
  }
};

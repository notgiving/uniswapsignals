import * as twilio from "twilio";

interface IMessage {
  send(message: string, to: string): void;
  sendToMultiple(message: string, to: string[]): void;
}

export class TwilioWhastAppMessage implements IMessage {
  private client: twilio.Twilio;
  constructor(accountSid: string, authToken: string) {
    this.client = new twilio.Twilio(accountSid, authToken);
  }

  send(message: string, to: string): void {
    try {
       this.client.messages
        .create({
          body: message,
          from: "whatsapp:+14155238886",
          to: "whatsapp:+91" + to,
        })
        .then((message) =>
          console.log("Twilio Message send, Message ID", message.sid)
        )
    } catch (err) {
      console.log("Twilio Message send error", err);
    }
  }

  sendToMultiple(message: string, to: string[]): void {
    to.forEach((phoneTo) => {
      try {
        this.client.messages
          .create({
            body: message,
            from: "whatsapp:+14155238886",
            to: "whatsapp:+91" + phoneTo,
          })
          .then((message) =>
            console.log("Twilio Message send, Message ID", message.sid)
          )
      } catch (err) {
        console.log("Twilio Message send error", err);
      }
    });
  }
}

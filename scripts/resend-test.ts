import { Resend } from "resend";
import { appConfig } from "@/app.config";

const resend = new Resend(appConfig.RESEND_API_KEY);

(async () => {
  const { data, error } = await resend.emails.send({
    from: "Acme <onboarding@ln1.one>",
    to: ["rus.inozemtsev@gmail.com"],
    subject: "Hello World",
    html: "<strong>It works!</strong>",
  });

  if (error) {
    return console.error({ error });
  }

  console.log({ data });
})();

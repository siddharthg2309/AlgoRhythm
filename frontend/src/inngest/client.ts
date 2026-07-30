import { Inngest } from "inngest";
import { env } from "~/env";

export const inngest = new Inngest({
  id: "music-generator",
  isDev: env.INNGEST_DEV,
  eventKey: env.INNGEST_EVENT_KEY,
});

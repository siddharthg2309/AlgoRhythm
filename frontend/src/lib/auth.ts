import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { Polar } from "@polar-sh/sdk";
import { checkout, polar, portal, webhooks } from "@polar-sh/better-auth";
import { db } from "~/server/db";
import { env } from "~/env";

const polarProducts = [
  { productId: "a209b547-608c-44e7-9178-4976a73c7135", slug: "small" },
  { productId: "11bce5cb-bfda-4c8f-afcc-4a512e2d7361", slug: "medium" },
  { productId: "7ddf3794-111c-45ba-bd4c-36935d8ed81b", slug: "large" },
];

const creditPacks: Record<string, number> = {
  "a209b547-608c-44e7-9178-4976a73c7135": 10,
  "11bce5cb-bfda-4c8f-afcc-4a512e2d7361": 25,
  "7ddf3794-111c-45ba-bd4c-36935d8ed81b": 50,
};

const billingPlugins =
  env.POLAR_ACCESS_TOKEN && env.POLAR_WEBHOOK_SECRET
    ? [
        polar({
          client: new Polar({ accessToken: env.POLAR_ACCESS_TOKEN, server: "sandbox" }),
          createCustomerOnSignUp: true,
          use: [
            checkout({ products: polarProducts, successUrl: "/", authenticatedUsersOnly: true }),
            portal(),
            webhooks({
              secret: env.POLAR_WEBHOOK_SECRET,
              onOrderPaid: async (order) => {
                const userId = order.data.customer.externalId;
                const productId = order.data.productId;
                const credits = productId ? (creditPacks[productId] ?? 0) : 0;
                if (!userId || credits === 0) throw new Error("Unknown Polar order");
                await db.user.update({
                  where: { id: userId },
                  data: { credits: { increment: credits } },
                });
              },
            }),
          ],
        }),
      ]
    : [];

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: billingPlugins,
});

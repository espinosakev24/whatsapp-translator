import { default as wpbot } from '@bot-whatsapp/bot';

import translate from 'translate';

import QRPortalWeb from '@bot-whatsapp/portal';
import BaileysProvider from '@bot-whatsapp/provider/baileys';
import JsonFileAdapter from '@bot-whatsapp/database/json';

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: '',
});

const { createBot, createProvider, createFlow, addKeyword } = wpbot;

const flowPrincipal = addKeyword([]).addAction(async (ctx, { flowDynamic }) => {
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: `Translate to english the message between "<" ">" characters, do not give details, only return the translation: <${ctx.body}> do not add the "<" ">" in the response`,
      },
    ],
    model: 'gpt-3.5-turbo',
  });

  console.log(chatCompletion.choices[0].message.content);

  return await flowDynamic(
    `[en] - ${chatCompletion.choices[0].message.content}`
  );
});

const main = async () => {
  const adapterDB = new JsonFileAdapter();
  const adapterFlow = createFlow([flowPrincipal]);
  const adapterProvider = createProvider(BaileysProvider);

  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });

  QRPortalWeb();
};

main();

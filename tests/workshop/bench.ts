// import { awaitAllCallbacks, AzureChatOpenAI } from '../test.deps.ts';
import * as parse from "npm:pdf-parse";
import { PDFLoader } from "npm:langchain/document_loaders/fs/pdf";

Deno.test("Workshop Bench", async (t) => {
  //   const model = new AzureChatOpenAI({
  //     modelName: 'gpt-4',
  //     temperature: 0.7,
  //     // maxTokens: 1000,
  //     maxRetries: 5,
  //     verbose: true,
  //   });

  await t.step("Invoke Test", async () => {
    const loader = new PDFLoader(
      "./training/azure/data-explorer/azure-data-explorer.pdf",
      {
        splitPages: false,
      },
    );

    const docs = await loader.load();

    console.log(docs);
  });

  // await awaitAllCallbacks();
});

import { PlaywrightWebBaseLoader } from "langchain/document_loaders/web/playwright";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { RetrievalQAChain, loadQAStuffChain } from "langchain/chains";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { HNSWLib } from "langchain/vectorstores/hnswlib";


export default async function (req, res) {
  const answer = await runQA(req.body.question, req.body.webUrl);
  res.status(200).json({ result: answer });
}

async function runQA(query, link) {
    
  // Load the documents and create the vector store
  const loader = new PlaywrightWebBaseLoader(
      link
  );
    
  const docs = await loader.loadAndSplit();
  const vectorStore = await HNSWLib.fromDocuments(
      docs,
      new OpenAIEmbeddings({ openAIApiKey: process.env.OPEN_AI_API_KEY }),
    );

  const model = new OpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0.75,
      openAIApiKey: process.env.OPEN_AI_API_KEY,
  });
  // Select the relevant documents
  const chain = new RetrievalQAChain({
      combineDocumentsChain: loadQAStuffChain(model),
      retriever: vectorStore.asRetriever(),
      returnSourceDocuments: false,
  });
  // Call the chain
  const res = await chain.call({
      query: query,
    });

  return res;
}
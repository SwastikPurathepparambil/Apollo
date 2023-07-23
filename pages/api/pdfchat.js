import multer from 'multer';
import bodyParser from 'body-parser';
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { RetrievalQAChain, loadQAStuffChain } from "langchain/chains";
import { HNSWLib } from "langchain/vectorstores/hnswlib";

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const config = {
    api: {
      bodyParser: false
    }
  }

const urlencodedParser = bodyParser.urlencoded({ extended: false });

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {

      upload.single('file')(req, res, async function (err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Error uploading file.' });
        }

        // Access the text data from the request body
        urlencodedParser(req, res, async function () {
            const { question, filename } = req.body;
  
            // Here, you can access the uploaded file using "req.file"

            const uploadedFile = req.file;

            const fileBlob = new Blob([uploadedFile.buffer], { type: uploadedFile.mimetype });

            const loader = new PDFLoader(fileBlob);
            const documents = await loader.loadAndSplit();
            
            const vectorStore = await HNSWLib.fromDocuments(
                documents,
                new OpenAIEmbeddings({ openAIApiKey: process.env.OPEN_AI_API_KEY }),
              );
          
            const model = new OpenAI({
                modelName: "gpt-3.5-turbo",
                temperature: 0.25,
                openAIApiKey: process.env.OPEN_AI_API_KEY,
            });
            // Select the relevant documents
            const chain = new RetrievalQAChain({
                combineDocumentsChain: loadQAStuffChain(model),
                retriever: vectorStore.asRetriever(),
                returnSourceDocuments: false,
            });
            // Call the chain
            const result = await chain.call({
                query: question,
              });
              
            console.log(result);
            return res.status(200).json({ result: result });
            
            // console.log('documents=>', documents);
  
            // You can now send the file to the backend or perform any other operations
            // return res.status(200).json({ message: 'File uploaded successfully.' });
          });
        });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'An error occurred while processing the file.' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed.' });
  }
}
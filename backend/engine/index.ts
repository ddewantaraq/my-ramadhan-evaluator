import * as llamaIndex from "npm:llamaindex@0.2.3";
import * as mod from "https://deno.land/std@0.213.0/dotenv/mod.ts";
await mod.load({export:true}) // read API key from .env
import pdfjs from "https://raw.githubusercontent.com/bundled-es-modules/pdfjs-dist/v2.5.207-rc1/build/pdf.js";

pdfjs.GlobalWorkerOptions.workerSrc =
   "https://raw.githubusercontent.com/bundled-es-modules/pdfjs-dist/v2.5.207-rc1/build/pdf.worker.min.js";

const documents = await new llamaIndex.SimpleDirectoryReader().loadData({
  directoryPath: "./data",
});

const index = await llamaIndex.VectorStoreIndex.fromDocuments(documents);
const customLLM = new llamaIndex.OpenAI();
const customEmbedding = new llamaIndex.OpenAIEmbedding();

const customServiceContext = llamaIndex.serviceContextFromDefaults({
  llm: customLLM,
  embedModel: customEmbedding,
});

const customQaPrompt = function ({ context = "", query = "" }) {
  return `Context information is below.
        ---------------------
        ${context}
        ---------------------
        Given the context information, answer the query.
        If you do not find any information from the training data, please answer "we do not know".\
        The fact comes from your training data.
        Query: ${query}
        Answer:`;
};

const customResponseBuilder = new llamaIndex.SimpleResponseBuilder(
  customServiceContext,
  customQaPrompt
);

const customSynthesizer = new llamaIndex.ResponseSynthesizer({
  responseBuilder: customResponseBuilder,
  serviceContext: customServiceContext,
});

const customRetriever = new llamaIndex.VectorIndexRetriever({
  index,
});

export function createCustomQueryEngine() {
    const customQueryEngine = new llamaIndex.RetrieverQueryEngine(
        customRetriever,
        customSynthesizer
    );
    return customQueryEngine;
}

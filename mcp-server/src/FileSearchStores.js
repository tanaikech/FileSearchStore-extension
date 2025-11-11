import { GoogleGenAI } from "@google/genai";
import * as path from "path";
import * as mime from "mime-types";

/**
 * A class to manage Google Gemini API File Search Stores and Documents.
 */
class FileSearchStores {
  /**
   * @param {string} [apiKey] - The Gemini API key. Defaults to process.env.GEMINI_API_KEY.
   * @param {string} [model] - The Gemini model name. Defaults to process.env.GEMINI_MODEL or "gemini-1.5-flash".
   */
  constructor(apiKey, model) {
    const resolvedApiKey = apiKey || process.env.GEMINI_API_KEY || null;
    if (!resolvedApiKey) {
      throw new Error("GEMINI_API_KEY environment variable not set.");
    }
    this.modelName = model || process.env.GEMINI_MODEL || "gemini-2.5-flash";
    this.ai = new GoogleGenAI({ apiKey: resolvedApiKey });
  }

  // --- File Search Stores Methods ---

  /**
   * Uploads a file (from text or path) to a File Search Store and waits for completion.
   * @param {object} params - The parameters.
   * @param {string} params.fileSearchStoreName - The name of the store.
   * @param {string} params.displayName - The display name for the uploaded document.
   * @param {string} [params.text] - The text data to upload. Provide this or filePath.
   * @param {string} [params.filePath] - The path to the file to upload. Provide this or text.
   * @param {string} [params.mimeType] - The MIME type of the file.
   * @param {object[]} [params.customMetadata] - Optional custom metadata.
   * @param {object[]} [params.chunkingConfig] - Optional chunking configuration.
   * @returns {Promise<object>} The completed document import object.
   */
  async media_upload({
    fileSearchStoreName,
    displayName,
    text,
    filePath,
    mimeType,
    customMetadata = [],
    chunkingConfig = [],
  }) {
    let file;
    if (text) {
      mimeType = mimeType || "text/plain";
      displayName = displayName || `sampleFile-${Date.now()}`;
      const buffer = Buffer.from(text, "utf8");
      const blob = new Blob([buffer], { type: mimeType });
      file = blob;
    } else if (filePath) {
      const fileName = path.basename(filePath);
      const fileExtension = path.extname(filePath);
      mimeType = mime.lookup(fileExtension);
      displayName = fileName;
      file = filePath;
    } else {
      throw new Error(`Provide "text" or "filePath".`);
    }
    const config = { displayName, mimeType };
    if (customMetadata.length > 0) {
      config.customMetadata = customMetadata;
    }
    if (chunkingConfig.length > 0) {
      config.chunkingConfig = chunkingConfig;
    }
    let operation = await this.ai.fileSearchStores.uploadToFileSearchStore({
      file,
      fileSearchStoreName,
      config,
    });
    while (!operation.done) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      operation = await this.operations_get({ operation });
    }
    return `Processing complete for: ${displayName}\ndocument name is "${operation.name}".`;
  }

  /**
   * Imports a File from File Service to a FileSearchStore.
   * @param {object} params - The parameters.
   * @param {string} params.fileSearchStoreName - Immutable. The name of the FileSearchStore to import the file into. Example: fileSearchStores/my-file-search-store-123 It takes the form fileSearchStores/{filesearchstore}.
   * @param {string} params.fileName - The name of the File to import. Example: files/abc-123
   * @param {object[]} [params.customMetadata] - Optional custom metadata.
   * @param {object[]} [params.chunkingConfig] - Optional chunking configuration.
   * @returns {Promise<object>} The operation object.
   */
  async import_file({
    fileSearchStoreName,
    fileName,
    customMetadata,
    chunkingConfig,
  }) {
    const object = {
      fileSearchStoreName,
      fileName,
      customMetadata,
      chunkingConfig,
    };
    let operation = await this.ai.fileSearchStores.importFile(object);
    while (!operation.done) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      operation = await this.operations_get({ operation });
    }
    return `Processing complete for: ${fileName}\ndocument name is "${operation.name}".`;
  }

  /**
   * Creates a new File Search Store.
   * @param {string} displayName - The display name for the new store.
   * @returns {Promise<object>} The created FileSearchStore object after the operation completes.
   */
  async create(displayName) {
    const createOperation = await this.ai.fileSearchStores.create({
      config: { displayName: displayName },
    });
    return createOperation;
  }

  /**
   * Deletes a File Search Store.
   * @param {string} fileSearchStoreName - The name of the store to delete.
   * @returns {Promise<void>}
   */
  async delete(fileSearchStoreName) {
    await this.ai.fileSearchStores.delete({
      name: fileSearchStoreName,
      config: { force: true },
    });
    return `File Search Store ${fileSearchStoreName} was deleted.`;
  }

  /**
   * Gets information about a specific File Search Store.
   * @param {string} fileSearchStoreName - The name of the store to retrieve.
   * @returns {Promise<object>} The FileSearchStore object.
   */
  async get(fileSearchStoreName) {
    return this.ai.fileSearchStores.get({ name: fileSearchStoreName });
  }

  /**
   * Lists all File Search Stores, handling pagination to retrieve all results.
   * @returns {Promise<object[]>} An array of all FileSearchStore objects.
   */
  async list() {
    let allStores = [];
    let pageToken;
    const pageSize = 100; // Max page size
    do {
      const response = await this.ai.fileSearchStores.list({
        page_size: pageSize,
        page_token: pageToken,
      });
      let page = response.page;
      allStores.push(...page);
      while (response.hasNextPage()) {
        page = response.nextPage();
        allStores.push(...page);
      }
      pageToken = response.nextPageToken;
    } while (pageToken);
    return allStores;
  }

  /**
   * Gets the status of a long-running operation for a File Search Store.
   * @param {object} operation - The object of the operation.
   * @returns {Promise<object>} The operation object.
   */
  async operations_get(operation) {
    return this.ai.operations.get(operation);
  }

  // --- Documents Methods ---

  /**
   * Deletes a document from a File Search Store.
   * @param {string} documentName - The name of the document to delete.
   * @returns {Promise<void>}
   */
  async documents_delete(documentName) {
    await this.ai.fileSearchStores.documents.delete({
      name: documentName,
      config: { force: true },
    });
    return `Document ${documentName} was deleted.`;
  }

  /**
   * Gets a specific document from a File Search Store.
   * @param {string} documentName - The name of the document to retrieve.
   * @returns {Promise<object>} The Document object.
   */
  async documents_get(documentName) {
    return this.ai.fileSearchStores.documents.get({ name: documentName });
  }

  /**
   * Lists all documents in a File Search Store, handling pagination.
   * @param {string} fileSearchStoreName - The name of the store.
   * @returns {Promise<object[]>} An array of all Document objects in the store.
   */
  async documents_list(fileSearchStoreName) {
    let allDocuments = [];
    let pageToken;
    const pageSize = 100; // Max page size
    do {
      const response = await this.ai.fileSearchStores.documents.list({
        parent: fileSearchStoreName,
        page_size: pageSize,
        page_token: pageToken,
      });
      let page = response.page;
      allDocuments.push(...page);
      while (response.hasNextPage()) {
        page = response.nextPage();
        allDocuments.push(...page);
      }
      pageToken = response.nextPageToken;
    } while (pageToken);
    return allDocuments;
  }

  // --- RAG Content Generation ---
  /**
   * Generates content using one or more File Search Stores as a RAG tool.
   * @param {object} params - The parameters for content generation.
   * @param {string[]} params.fileSearchStoreNames - The names of the stores to use as a tool (e.g., ['fileSearchStores/my-store-123']).
   * @param {string} params.prompt - The user's prompt for content generation.
   * @param {string|null} [params.metadataFilter=null] - The metadata filter to apply.
   * @returns {Promise<string>} The generated text content.
   */
  async generate_content({
    fileSearchStoreNames = [],
    prompt,
    metadataFilter = null,
  }) {
    const fileSearch = {};
    if (fileSearchStoreNames.length > 0) {
      fileSearch.fileSearchStoreNames = fileSearchStoreNames;
    }
    if (metadataFilter) {
      fileSearch.metadataFilter = metadataFilter;
    }
    const config =
      Object.keys(fileSearch).length > 0 ? { tools: [{ fileSearch }] } : {};
    const result = await this.ai.models.generateContent({
      model: this.modelName,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config,
    });
    return result?.text ?? "No response";
  }
}

export default FileSearchStores;

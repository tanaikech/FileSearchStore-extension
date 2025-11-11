import FileSearchStores from "./FileSearchStores.js";
import { z } from "zod";

async function run_({ method, params }) {
  let result;
  try {
    if (!process.env.GEMINI_API_KEY) {
      return {
        content: [
          {
            type: "text",
            text: "No API key for using Gemini API. Please set it as GEMINI_API_KEY.",
          },
        ],
        isError: true,
      };
    }
    const f = new FileSearchStores();
    let text = (await f[method](params)) || "";
    if (typeof text == "object") {
      text = JSON.stringify(text);
    }
    result = {
      content: [{ type: "text", text }],
      isError: false,
    };
  } catch ({ stack }) {
    result = { content: [{ type: "text", text: stack }], isError: true };
  }
  // console.log(result); // Check response.
  return result;
}

const __tools = [
  {
    name: "file_search_store_create",
    schema: {
      description: "Use this to create a new file search store.",
      inputSchema: {
        displayName: z
          .string()
          .describe(
            `The human-readable display name for the FileSearchStore. The display name must be no more than 512 characters in length, including spaces. Example: "Docs on Semantic Retriever"`
          )
          .optional(),
      },
    },
    func: async (object = {}) =>
      await run_({ method: "create", params: object.displayName }),
  },
  {
    name: "file_search_store_list",
    schema: {
      description: "Use this to get a list of file search stores.",
      inputSchema: {},
    },
    func: async (object = {}) => await run_({ method: "list", params: null }),
  },
  {
    name: "file_search_store_delete",
    schema: {
      description: "Use this to delete the file search store.",
      inputSchema: {
        name: z
          .string()
          .describe(
            "The resource name of the FileSearchStore. Example: fileSearchStores/my-file-search-store-123 It takes the form fileSearchStores/{filesearchstore}."
          ),
      },
    },
    func: async (object = {}) =>
      await run_({ method: "delete", params: object.name }),
  },
  {
    name: "file_search_store_get",
    schema: {
      description: "Use this to get the metadata of the file search store.",
      inputSchema: {
        name: z
          .string()
          .describe(
            "The name of the FileSearchStore. Example: fileSearchStores/my-file-search-store-123 It takes the form fileSearchStores/{filesearchstore}."
          ),
      },
    },
    func: async (object = {}) =>
      await run_({ method: "get", params: object.name }),
  },
  {
    name: "file_search_store_upload_media",
    schema: {
      description:
        "Use this to upload a file or a raw text to the file search store.",
      inputSchema: {
        fileSearchStoreName: z
          .string()
          .describe(
            `The server-assigned name, which is only unique within the same service that originally returns it. If you use the default HTTP mapping, the name should be a resource name ending with operations/{unique_id}. The data will be uploaded to this file search store. **As an important point, in this tool, it is required to provide "text" or "filePath".**`
          ),
        displayName: z
          .string()
          .describe("The display name for the uploaded document.")
          .optional(),
        text: z.string().describe("The raw text data to upload.").optional(),
        filePath: z
          .string()
          .describe("The path to the file to upload.")
          .optional(),
        mimeType: z
          .string()
          .describe(
            "MIME type of the data. If not provided, it will be inferred from the uploaded content."
          )
          .optional(),
        customMetadata: z
          .array(
            z.array(
              z.object({
                key: z.string().describe("The key of the metadata to store."),
                stringValue: z
                  .string()
                  .describe("The string value of the metadata to store.")
                  .optional(),
                stringValue: z
                  .string()
                  .describe("The string value of the metadata to store.")
                  .optional(),
                numericValue: z
                  .string()
                  .describe("The numeric value of the metadata to store.")
                  .optional(),
              })
            )
          )
          .describe("Custom metadata to be associated with the data.")
          .optional(),
        chunkingConfig: z
          .array(
            z.object({
              whiteSpaceConfig: z.object({
                maxTokensPerChunk: z
                  .number()
                  .describe("Maximum number of tokens per chunk."),
                maxOverlapTokens: z
                  .number()
                  .describe(
                    "Maximum number of overlapping tokens between two adjacent chunks."
                  ),
              }),
            })
          )
          .describe(
            "Config for telling the service how to chunk the data. If not provided, the service will use default parameters."
          )
          .optional(),
      },
    },
    func: async (object = {}) =>
      await run_({ method: "media_upload", params: object }),
  },
  {
    name: "file_search_store_import_file",
    schema: {
      description:
        "Use this to upload a file or a raw text to the file search store.",
      inputSchema: {
        fileSearchStoreName: z
          .string()
          .describe(
            `Immutable. The name of the FileSearchStore to import the file into. Example: fileSearchStores/my-file-search-store-123 It takes the form fileSearchStores/{filesearchstore}.`
          ),
        fileName: z
          .string()
          .describe("The name of the File to import. Example: files/abc-123"),
        customMetadata: z
          .array(
            z.array(
              z.object({
                key: z.string().describe("The key of the metadata to store."),
                stringValue: z
                  .string()
                  .describe("The string value of the metadata to store.")
                  .optional(),
                stringValue: z
                  .string()
                  .describe("The string value of the metadata to store.")
                  .optional(),
                numericValue: z
                  .string()
                  .describe("The numeric value of the metadata to store.")
                  .optional(),
              })
            )
          )
          .describe("Custom metadata to be associated with the data.")
          .optional(),
        chunkingConfig: z
          .array(
            z.object({
              whiteSpaceConfig: z.object({
                maxTokensPerChunk: z
                  .number()
                  .describe("Maximum number of tokens per chunk."),
                maxOverlapTokens: z
                  .number()
                  .describe(
                    "Maximum number of overlapping tokens between two adjacent chunks."
                  ),
              }),
            })
          )
          .describe(
            "Config for telling the service how to chunk the data. If not provided, the service will use default parameters."
          )
          .optional(),
      },
    },
    func: async (object = {}) =>
      await run_({ method: "import_file", params: object }),
  },
  {
    name: "operation_get",
    schema: {
      description:
        "Use this to get the latest state of a long-running operation. Clients can use this method to poll the operation result at intervals as recommended by the API service.",
      inputSchema: {
        name: z
          .string()
          .describe(
            "The name of the operation resource. It takes the form fileSearchStores/{filesearchstore}/operations/{operation}."
          ),
      },
    },
    func: async (object = {}) => await run_({ method: "get", params: object }),
  },
  {
    name: "document_delete",
    schema: {
      description: "Use this to delete a document.",
      inputSchema: {
        name: z
          .string()
          .describe(
            "The resource name of the Document to delete. Example: fileSearchStores/my-file-search-store-123/documents/the-doc-abc It takes the form fileSearchStores/{filesearchstore}/documents/{document}."
          ),
      },
    },
    func: async (object = {}) =>
      await run_({ method: "documents_delete", params: object.name }),
  },
  {
    name: "document_get",
    schema: {
      description: "Use this to get information about a specific Document.",
      inputSchema: {
        name: z
          .string()
          .describe(
            "The name of the Document to retrieve. Example: fileSearchStores/my-file-search-store-123/documents/the-doc-abc It takes the form fileSearchStores/{filesearchstore}/documents/{document}."
          ),
      },
    },
    func: async (object = {}) =>
      await run_({ method: "documents_get", params: object.name }),
  },
  {
    name: "document_list",
    schema: {
      description: "Use this to list all Documents in a file search store.",
      inputSchema: {
        parent: z
          .string()
          .describe(
            "The name of the FileSearchStore containing Documents. Example: fileSearchStores/my-file-search-store-123 It takes the form fileSearchStores/{filesearchstore}."
          ),
      },
    },
    func: async (object = {}) =>
      await run_({ method: "documents_list", params: object.parent }),
  },
  {
    name: "generate_content",
    schema: {
      description:
        "Use this to generate content using the file search stores with Gemini API.",
      inputSchema: {
        fileSearchStoreNames: z
          .array(
            z
              .string()
              .describe(
                "The names of the fileSearchStores to retrieve from. Example: fileSearchStores/my-file-search-store-123"
              )
          )
          .describe(
            "An array including the names of the FileSearchStore containing Documents. When you want to generate content using the file search stores as Retrieval Augmented Generation (RAG), use this."
          )
          .optional(),
        prompt: z
          .string()
          .describe(
            "The name of the FileSearchStore containing Documents. Example: fileSearchStores/my-file-search-store-123 It takes the form fileSearchStores/{filesearchstore}."
          ),
        metadataFilter: z
          .string()
          .describe(
            "Metadata filter to apply to the semantic retrieval documents and chunks."
          )
          .optional(),
      },
    },
    func: async (object = {}) =>
      await run_({ method: "generate_content", params: object }),
  },
];

export const tools = [...__tools];

// const __f = [
//   "create_file_search_store",
//   "get_file_search_store_list",
//   // "delete_file_search_store",
//   // "get_file_search_store",
//   // "upload_media_to_file_search_store",
//   // "upload_media_to_file_search_store",
//   // "get_operation",
//   // "delete_document",
//   // "get_document",
//   // "get_document",
//   // "generate_content",
// ];
// const __ftools = __tools.filter((e) => __f.includes(e.name));
// export const tools = [...__ftools];

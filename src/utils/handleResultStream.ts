import type { ClientResponse } from "hono/client";
import type { StatusCode } from "hono/utils/http-status";
import type { ZodSchema } from "zod";
import type z from "zod";

export const handleStream = <T extends ZodSchema>(
  response: ClientResponse<{}, StatusCode, string>,
  onMessage: (message: z.infer<T>) => void,
  messageSchema: T,
) => {
  const stream = response.body;
  if (!stream) {
    throw new Error("No stream");
  }
  // Get the reader from the stream
  const reader = stream.getReader();
  // Define a function to read each chunk
  const readChunk = () => {
    // Read a chunk from the reader
    reader
      .read()
      .then(async ({ value, done }) => {
        // Check if the stream is done
        if (done) {
          // Log a message
          console.log("Stream finished");
          // Return from the function
          return;
        }
        // Convert the chunk value to a string
        const chunkString = new TextDecoder().decode(value);
        // Log the chunk string
        console.log("===", chunkString, "===");
        const parsed = messageSchema.safeParse(
          await JSON.parse(chunkString.trim()),
        );
        if (parsed.success) {
          onMessage(parsed.data);
        } else {
          console.log("failed to parse", parsed.error);
        }
        // Read the next chunk
        readChunk();
      })
      .catch((error) => {
        // Log the error
        console.error(error);
      });
  };
  // Start reading the first chunk
  readChunk();
};

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  DeleteCommand,
  ScanCommand,
  BatchGetCommand,
  BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";

const tableName = process.env.DYNAMODB_TABLE_NAME || "certifyer-dev-kv";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const docClient = DynamoDBDocumentClient.from(client);

// Set stores a key-value pair in the database.
export const set = async (key: string, value: any): Promise<void> => {
  await docClient.send(
    new PutCommand({
      TableName: tableName,
      Item: { key, value },
    }),
  );
};

// Get retrieves a key-value pair from the database.
export const get = async (key: string): Promise<any> => {
  const response = await docClient.send(
    new GetCommand({
      TableName: tableName,
      Key: { key },
    }),
  );
  return response.Item?.value;
};

// Delete deletes a key-value pair from the database.
export const del = async (key: string): Promise<void> => {
  await docClient.send(
    new DeleteCommand({
      TableName: tableName,
      Key: { key },
    }),
  );
};

// Sets multiple key-value pairs in the database.
export const mset = async (keys: string[], values: any[]): Promise<void> => {
  // BatchWriteItem supports up to 25 items per request
  const maxBatch = 25;
  for (let i = 0; i < keys.length; i += maxBatch) {
    const chunkKeys = keys.slice(i, i + maxBatch);
    const chunkValues = values.slice(i, i + maxBatch);

    const putRequests = chunkKeys.map((k, idx) => ({
      PutRequest: {
        Item: { key: k, value: chunkValues[idx] },
      },
    }));

    await docClient.send(
      new BatchWriteCommand({
        RequestItems: {
          [tableName]: putRequests,
        },
      }),
    );
  }
};

// Gets multiple key-value pairs from the database.
export const mget = async (keys: string[]): Promise<any[]> => {
  if (keys.length === 0) return [];
  
  // BatchGetItem supports up to 100 items per request
  const maxBatch = 100;
  const results: any[] = [];

  for (let i = 0; i < keys.length; i += maxBatch) {
    const chunkKeys = keys.slice(i, i + maxBatch);
    const response = await docClient.send(
      new BatchGetCommand({
        RequestItems: {
          [tableName]: {
            Keys: chunkKeys.map((k) => ({ key: k })),
          },
        },
      }),
    );

    const items = response.Responses?.[tableName] || [];
    results.push(...items.map((item) => item.value));
  }

  return results;
};

// Deletes multiple key-value pairs from the database.
export const mdel = async (keys: string[]): Promise<void> => {
  if (keys.length === 0) return;

  const maxBatch = 25;
  for (let i = 0; i < keys.length; i += maxBatch) {
    const chunkKeys = keys.slice(i, i + maxBatch);
    const deleteRequests = chunkKeys.map((k) => ({
      DeleteRequest: {
        Key: { key: k },
      },
    }));

    await docClient.send(
      new BatchWriteCommand({
        RequestItems: {
          [tableName]: deleteRequests,
        },
      }),
    );
  }
};

// Search for key-value pairs by prefix.
export const getByPrefix = async (prefix: string): Promise<any[]> => {
  const results: any[] = [];
  let lastEvaluatedKey: any = undefined;

  do {
    const response = await docClient.send(
      new ScanCommand({
        TableName: tableName,
        FilterExpression: "begins_with(#k, :prefix)",
        ExpressionAttributeNames: {
          "#k": "key",
        },
        ExpressionAttributeValues: {
          ":prefix": prefix,
        },
        ExclusiveStartKey: lastEvaluatedKey,
      }),
    );

    const items = response.Items || [];
    results.push(...items.map((item) => item.value));
    lastEvaluatedKey = response.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  return results;
};

// Get keys by prefix (returns array of keys, not values)
export const getKeysByPrefix = async (prefix: string): Promise<string[]> => {
  const results: string[] = [];
  let lastEvaluatedKey: any = undefined;

  do {
    const response = await docClient.send(
      new ScanCommand({
        TableName: tableName,
        ProjectionExpression: "#k",
        FilterExpression: "begins_with(#k, :prefix)",
        ExpressionAttributeNames: {
          "#k": "key",
        },
        ExpressionAttributeValues: {
          ":prefix": prefix,
        },
        ExclusiveStartKey: lastEvaluatedKey,
      }),
    );

    const items = response.Items || [];
    results.push(...items.map((item) => item.key));
    lastEvaluatedKey = response.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  return results;
};

// List entries by prefix — returns an async iterable of { key, value } objects.
export async function* list(options: { prefix: string }): AsyncGenerator<{ key: string; value: any }> {
  let lastEvaluatedKey: any = undefined;

  do {
    const response = await docClient.send(
      new ScanCommand({
        TableName: tableName,
        FilterExpression: "begins_with(#k, :prefix)",
        ExpressionAttributeNames: {
          "#k": "key",
        },
        ExpressionAttributeValues: {
          ":prefix": options.prefix,
        },
        ExclusiveStartKey: lastEvaluatedKey,
      }),
    );

    const items = response.Items || [];
    for (const item of items) {
      yield { key: item.key, value: item.value };
    }
    lastEvaluatedKey = response.LastEvaluatedKey;
  } while (lastEvaluatedKey);
}

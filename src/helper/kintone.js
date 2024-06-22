import {KintoneRestAPIClient} from '@kintone/rest-api-client';

export function generateClient() {
  const baseUrl = import.meta.env.VITE_KINTONE_BASE_URL;
  console.log({baseUrl});

  const clientOpt =
    typeof kintone === 'undefined'
      ? {
          baseUrl,
          auth: {
            username: import.meta.env.VITE_KINTONE_USERNAME,
            password: import.meta.env.VITE_KINTONE_PASSWORD,
          },
        }
      : {};

  const client = new KintoneRestAPIClient(clientOpt);

  return client;
}

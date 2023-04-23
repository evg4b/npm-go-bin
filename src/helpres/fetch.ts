import fetch, { Response } from 'node-fetch';

export const loadFile = (url: string) => {
  return fetch(url).then((res: Response) => !res.ok
    ? Promise.reject(new Error(`Error downloading binary. HTTP Status Code: ${ res.status } - ${ res.statusText }`))
    : Promise.resolve(res.body));
}

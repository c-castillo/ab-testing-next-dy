
export function getBucket(buckets: readonly string[]) {
  // Get a random number between 0 and 1
  let n = cryptoRandom() * 100
  // Get the percentage of each bucket
  let percentage = 100 / buckets.length
  // Loop through the buckets and see if the random number falls
  // within the range of the bucket
  return (
    buckets.find(() => {
      n -= percentage
      return n <= 0
    }) ?? buckets[0]
  )
}

function cryptoRandom() {
  return crypto.getRandomValues(new Uint32Array(1))[0] / (0xffffffff + 1)
}

const DYHOST = 'https://dy-api.com';

export async function choose(apiKey: string, dyContext: object, selectors: readonly string[]) {

  const options = {
    method: 'POST',
    uri: `${DYHOST}/v2/serve/user/choose`,
    headers: {
      'DY-API-Key': apiKey,
    },
    body: {
      selector: {
        names: selectors,
      },
      context: dyContext,
    },
    json: true,
  };
  const { method, uri, headers, body } = options

  let variationTitle = '';
  try {
    const response: any = await fetch(uri, { method, headers, body: JSON.stringify(body) });
    const json: any = await response.json()
    variationTitle = json.choices[0].variations[0].payload.data.title
  } catch (e: any) {
    console.error(`ERROR IN CHOOSE: ${e.message}`);
  }
  return variationTitle
}






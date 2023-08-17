
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

export async function choose(apiKey: string, dyContext: object, buckets: readonly string[]) {

  const options = {
    method: 'POST',
    uri: `${DYHOST}/v2/serve/user/choose`,
    headers: {
      'DY-API-Key': apiKey,
    },
    body: {
      selector: {
        names: ['Lemonade PoC'],
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

function flattenCampaignData(res: any, choice: any) {
  let data = null;
  if (choice.variations.length > 0) {
    switch (choice.type) {
      case 'DECISION':
        data = { decisionId: choice.decisionId, ...choice.variations[0].payload.data };
        break;
      case 'RECS_DECISION':
        data = choice.variations[0].payload.data.slots.map(
          (slot: { productData: any; sku: any; slotId: any }) => ({ ...slot.productData, sku: slot.sku, slotId: slot.slotId }));
        break;
      default:
        throw new Error('Unknown choice type: ' + choice.type);
    }
  }

  res[choice.name] = data;
  return res;
}




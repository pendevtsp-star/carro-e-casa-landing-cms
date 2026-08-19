const https = require('https');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function inspectJob(runId) {
  const data = await fetchJson(`https://api.github.com/repos/pendevtsp-star/carro-e-casa-landing-cms/actions/runs/${runId}/jobs`);
  console.log(`=== Jobs for Run ${runId} ===`);
  for (const job of (data.jobs || [])) {
    console.log(`Job: ${job.name} | Status: ${job.status} | Conclusion: ${job.conclusion}`);
    for (const step of (job.steps || [])) {
      console.log(`  - Step: ${step.name} | Status: ${step.status} | Conclusion: ${step.conclusion}`);
    }
  }
}

async function main() {
  await inspectJob(32301469939); // Deploy de producao
  console.log('\n========================================\n');
  await inspectJob(32301469761); // Quality - Checks
}

main().catch(console.error);

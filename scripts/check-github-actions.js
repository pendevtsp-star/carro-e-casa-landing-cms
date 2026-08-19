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

async function checkRuns() {
  const data = await fetchJson('https://api.github.com/repos/pendevtsp-star/carro-e-casa-landing-cms/actions/runs?per_page=10');
  console.log(`Total workflow runs: ${data.total_count}`);
  
  for (const run of (data.workflow_runs || [])) {
    console.log(`- [${run.name}] (#${run.run_number})`);
    console.log(`  ID: ${run.id}`);
    console.log(`  Commit: ${run.head_commit?.message?.split('\n')[0]} (${run.head_sha?.substring(0, 7)})`);
    console.log(`  Status: ${run.status}`);
    console.log(`  Conclusion: ${run.conclusion}`);
    console.log(`  Created: ${run.created_at}`);
    console.log(`  URL: ${run.html_url}`);
    console.log('--------------------------------------------------');
  }
}

checkRuns().catch(console.error);

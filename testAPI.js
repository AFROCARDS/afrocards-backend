const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/categories',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('✅ API Response:');
      console.log(JSON.stringify(json, null, 2));
      
      // Check if sousCategories are present
      if (json.data && json.data.length > 0) {
        const firstCat = json.data[0];
        if (firstCat.sousCategories) {
          console.log('\n✅ Subcategories found in API response!');
          console.log(`Category "${firstCat.nom}" has ${firstCat.sousCategories.length} subcategories`);
        } else {
          console.log('\n⚠️ No subcategories in response');
        }
      }
    } catch (e) {
      console.error('❌ Failed to parse JSON:', e.message);
      console.log('Raw response:', data);
    }
    process.exit(0);
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
  process.exit(1);
});

req.end();

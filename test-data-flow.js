// Test script to verify JSON data flow from your Contentful app
// Usage: node test-data-flow.js

const https = require('https');

// Configuration - Replace with your actual values
const SPACE_ID = 'your-space-id';
const ACCESS_TOKEN = 'your-content-delivery-api-key';
const CONTENT_TYPE = 'landingPage';
const TEST_SLUG = 'homepage';

// Test data that your app should be sending
const expectedDataStructure = {
  components: [
    {
      id: expect.stringMatching(/hero-\d+/),
      type: 'HeroBlock',
      name: 'Hero Block'
    },
    {
      id: expect.stringMatching(/twoColumn-\d+/),
      type: 'TwoColumnRow', 
      name: 'Two Column Row'
    }
  ],
  lastModified: expect.stringMatching(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/),
  version: '1.0'
};

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` } }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(new Error(`Failed to parse JSON: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

async function testDataFlow() {
  console.log('🔍 Testing Contentful data flow...\n');
  
  try {
    // Step 1: Fetch all landing page entries
    console.log('📥 Step 1: Fetching landing page entries...');
    const url = `https://cdn.contentful.com/spaces/${SPACE_ID}/entries?content_type=${CONTENT_TYPE}&include=2`;
    const response = await makeRequest(url);
    
    if (!response.items || response.items.length === 0) {
      console.log('❌ No landing page entries found.');
      console.log('💡 Create a landing page entry in Contentful first.');
      return;
    }
    
    console.log(`✅ Found ${response.items.length} landing page entry(ies)\n`);
    
    // Step 2: Check each entry for layout data
    console.log('📊 Step 2: Checking layout configuration data...\n');
    
    response.items.forEach((entry, index) => {
      console.log(`--- Entry ${index + 1} ---`);
      console.log(`Title: ${entry.fields.title || 'N/A'}`);
      console.log(`Slug: ${entry.fields.slug || 'N/A'}`);
      
      const layoutConfig = entry.fields.layoutConfig;
      
      if (!layoutConfig) {
        console.log('❌ No layout configuration found');
        console.log('💡 Click on the Layout Configuration field in Contentful and add some components');
      } else {
        console.log('✅ Layout configuration found!');
        console.log('📋 Data structure:');
        console.log(JSON.stringify(layoutConfig, null, 2));
        
        // Validate data structure
        const isValid = validateDataStructure(layoutConfig);
        if (isValid) {
          console.log('✅ Data structure is valid!');
        } else {
          console.log('❌ Data structure validation failed');
        }
      }
      console.log('');
    });
    
    // Step 3: Test fetching by slug
    console.log('🔍 Step 3: Testing fetch by slug...');
    const slugUrl = `https://cdn.contentful.com/spaces/${SPACE_ID}/entries?content_type=${CONTENT_TYPE}&fields.slug=${TEST_SLUG}&include=2`;
    const slugResponse = await makeRequest(slugUrl);
    
    if (slugResponse.items && slugResponse.items.length > 0) {
      const page = slugResponse.items[0];
      console.log(`✅ Found page with slug "${TEST_SLUG}"`);
      
      if (page.fields.layoutConfig) {
        console.log('✅ Layout data is accessible via API');
        console.log(`📊 Components count: ${page.fields.layoutConfig.components?.length || 0}`);
      } else {
        console.log('❌ No layout data found for this slug');
      }
    } else {
      console.log(`❌ No page found with slug "${TEST_SLUG}"`);
      console.log('💡 Create a page with this slug or update TEST_SLUG in the script');
    }
    
  } catch (error) {
    console.error('❌ Error testing data flow:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your SPACE_ID and ACCESS_TOKEN');
    console.log('2. Ensure your content type is named "landingPage"');
    console.log('3. Verify you have a landing page entry with layout data');
  }
}

function validateDataStructure(data) {
  // Check if data has required properties
  if (!data.components || !Array.isArray(data.components)) {
    console.log('❌ Missing or invalid components array');
    return false;
  }
  
  if (!data.lastModified || typeof data.lastModified !== 'string') {
    console.log('❌ Missing or invalid lastModified');
    return false;
  }
  
  if (!data.version || data.version !== '1.0') {
    console.log('❌ Missing or invalid version');
    return false;
  }
  
  // Check each component
  for (const component of data.components) {
    if (!component.id || typeof component.id !== 'string') {
      console.log('❌ Component missing or invalid id');
      return false;
    }
    
    if (!component.type || !['HeroBlock', 'TwoColumnRow', 'ImageGrid'].includes(component.type)) {
      console.log('❌ Component missing or invalid type');
      return false;
    }
    
    if (!component.name || typeof component.name !== 'string') {
      console.log('❌ Component missing or invalid name');
      return false;
    }
  }
  
  return true;
}

// Run the test
if (require.main === module) {
  console.log('🚀 Contentful Data Flow Test');
  console.log('=============================\n');
  
  if (SPACE_ID === 'your-space-id' || ACCESS_TOKEN === 'your-content-delivery-api-key') {
    console.log('❌ Please update SPACE_ID and ACCESS_TOKEN in this script first');
    console.log('💡 Get these values from Contentful → Settings → API keys');
    process.exit(1);
  }
  
  testDataFlow().then(() => {
    console.log('\n✅ Test completed!');
  }).catch((error) => {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  });
}

module.exports = { testDataFlow, validateDataStructure }; 
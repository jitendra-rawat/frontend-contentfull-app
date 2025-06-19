# 📊 JSON Data Guide: Viewing and Fetching Layout Data

## 🎯 **What Your App Sends to Contentful**

Your Layout Editor app sends this exact JSON structure to Contentful:

```json
{
  "components": [
    {
      "id": "hero-1703123456789",
      "type": "HeroBlock",
      "name": "Hero Block"
    },
    {
      "id": "twoColumn-1703123456790", 
      "type": "TwoColumnRow",
      "name": "Two Column Row"
    },
    {
      "id": "imageGrid-1703123456791",
      "type": "ImageGrid", 
      "name": "2x2 Image Grid"
    }
  ],
  "lastModified": "2024-01-15T10:30:00.000Z",
  "version": "1.0"
}
```

## 🔍 **How to View JSON Data in Contentful**

### **Method 1: Contentful Web App (Easiest)**

1. **Go to Contentful** → **Content** → **Your Landing Page entry**
2. **Find the "Layout Configuration" field**
3. **Click on it** to open your app
4. **Add some components** and **save**
5. **Go back to the entry view**
6. **Look for a JSON icon** ⚙️ or **"Show JSON"** button
7. **Click it** to see the raw JSON data

### **Method 2: Contentful API Explorer**

1. **Go to Contentful** → **Settings** → **API keys**
2. **Copy your Space ID and Content Delivery API key**
3. **Use this URL** (replace with your values):

```
https://cdn.contentful.com/spaces/YOUR_SPACE_ID/entries?content_type=landingPage&include=2
```

### **Method 3: Browser Console**

1. **Open your app** in Contentful
2. **Open browser console** (F12)
3. **Add components and save**
4. **Look for these console messages**:

```
🔄 Manually saving to Contentful: {
  components: [...],
  lastModified: "2024-01-15T10:30:00.000Z", 
  version: "1.0"
}
✅ Layout manually saved to Contentful successfully
```

## 📋 **Contentful Content Type Setup**

### **Step 1: Create Landing Page Content Type**

In Contentful, create a content type called **"Landing Page"** with these fields:

| Field Name | Field ID | Type | Required | Widget |
|------------|----------|------|----------|---------|
| Title | `title` | Short text | ✅ Yes | - |
| Slug | `slug` | Short text | ✅ Yes | - |
| Layout Configuration | `layoutConfig` | Object | ❌ No | Your App |

### **Step 2: Configure the Layout Field**

For the **"Layout Configuration"** field:

```json
{
  "id": "layoutConfig",
  "name": "Layout Configuration",
  "type": "Object",
  "required": false,
  "widgetId": "5uMF9vbxAHC29sHFQkVi9N"
}
```

**Important**: The `widgetId` must match your app's ID from `contentful-app.json`.

## 🚀 **How Your Second App Can Fetch the Data**

### **Option 1: Using Contentful JavaScript SDK**

```javascript
// Install: npm install contentful
import { createClient } from 'contentful';

const client = createClient({
  space: 'your-space-id',
  accessToken: 'your-content-delivery-api-key',
});

async function getLandingPage(slug) {
  try {
    const response = await client.getEntries({
      content_type: 'landingPage',
      'fields.slug': slug,
      include: 2,
    });

    if (response.items.length > 0) {
      const page = response.items[0];
      const layoutConfig = page.fields.layoutConfig;
      
      return {
        title: page.fields.title,
        slug: page.fields.slug,
        layout: layoutConfig?.components || [],
        lastModified: layoutConfig?.lastModified,
        version: layoutConfig?.version
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching landing page:', error);
    return null;
  }
}

// Usage
const pageData = await getLandingPage('homepage');
console.log('Layout components:', pageData.layout);
```

### **Option 2: Using REST API**

```javascript
async function getLandingPage(slug) {
  const spaceId = 'your-space-id';
  const accessToken = 'your-content-delivery-api-key';
  
  try {
    const response = await fetch(
      `https://cdn.contentful.com/spaces/${spaceId}/entries?content_type=landingPage&fields.slug=${slug}&include=2`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();
    
    if (data.items.length > 0) {
      const page = data.items[0];
      const layoutConfig = page.fields.layoutConfig;
      
      return {
        title: page.fields.title,
        slug: page.fields.slug,
        layout: layoutConfig?.components || [],
        lastModified: layoutConfig?.lastModified,
        version: layoutConfig?.version
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching landing page:', error);
    return null;
  }
}
```

### **Option 3: Using GraphQL API**

```javascript
// Install: npm install graphql-request
import { GraphQLClient, gql } from 'graphql-request';

const client = new GraphQLClient(
  'https://graphql.contentful.com/content/v1/spaces/your-space-id',
  {
    headers: {
      authorization: 'Bearer your-content-delivery-api-key',
    },
  }
);

const GET_LANDING_PAGE = gql`
  query GetLandingPage($slug: String!) {
    landingPageCollection(where: { slug: $slug }, limit: 1) {
      items {
        title
        slug
        layoutConfig {
          components {
            id
            type
            name
          }
          lastModified
          version
        }
      }
    }
  }
`;

async function getLandingPage(slug) {
  try {
    const data = await client.request(GET_LANDING_PAGE, { slug });
    const page = data.landingPageCollection.items[0];
    
    if (page && page.layoutConfig) {
      return {
        title: page.title,
        slug: page.slug,
        layout: page.layoutConfig.components,
        lastModified: page.layoutConfig.lastModified,
        version: page.layoutConfig.version
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching landing page:', error);
    return null;
  }
}
```

## 🎨 **Rendering the Layout in Your Second App**

```javascript
function renderLayout(components) {
  return components.map(component => {
    switch (component.type) {
      case 'HeroBlock':
        return <HeroBlock key={component.id} />;
      case 'TwoColumnRow':
        return <TwoColumnRow key={component.id} />;
      case 'ImageGrid':
        return <ImageGrid key={component.id} />;
      default:
        return <div key={component.id}>Unknown component: {component.type}</div>;
    }
  });
}

// Usage in your React component
function LandingPage({ pageData }) {
  return (
    <div>
      <h1>{pageData.title}</h1>
      <div className="layout">
        {renderLayout(pageData.layout)}
      </div>
    </div>
  );
}
```

## 🔧 **Testing the Data Flow**

### **Step 1: Create Test Content**

1. **In Contentful**, create a new Landing Page entry
2. **Fill in Title and Slug** (e.g., "Homepage", "homepage")
3. **Click the Layout Configuration field**
4. **Add some components** using your app
5. **Save the layout**

### **Step 2: Verify JSON Data**

```bash
# Test API call
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  "https://cdn.contentful.com/spaces/YOUR_SPACE_ID/entries?content_type=landingPage&fields.slug=homepage"
```

### **Step 3: Test in Your Second App**

```javascript
// Test the fetch function
const testPage = await getLandingPage('homepage');
console.log('Fetched data:', testPage);

// Expected output:
{
  title: "Homepage",
  slug: "homepage", 
  layout: [
    {
      id: "hero-1703123456789",
      type: "HeroBlock",
      name: "Hero Block"
    },
    // ... more components
  ],
  lastModified: "2024-01-15T10:30:00.000Z",
  version: "1.0"
}
```

## 🚨 **Common Issues & Solutions**

### **Issue 1: Field Not Showing JSON Data**
- **Solution**: Ensure field type is "Object" not "Text"
- **Check**: Widget ID matches your app ID

### **Issue 2: API Returns Empty Data**
- **Solution**: Verify content type name matches exactly
- **Check**: API key has proper permissions

### **Issue 3: Components Not Rendering**
- **Solution**: Ensure component types match your render logic
- **Check**: Component mapping in renderLayout function

### **Issue 4: Data Not Saving**
- **Solution**: Check browser console for errors
- **Verify**: App has write permissions in Contentful

## 📊 **Data Structure Reference**

### **Component Types Available**
- `HeroBlock` - Hero section component
- `TwoColumnRow` - Two-column layout component  
- `ImageGrid` - 2x2 image grid component

### **JSON Schema**
```json
{
  "type": "object",
  "properties": {
    "components": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "type": { 
            "type": "string",
            "enum": ["HeroBlock", "TwoColumnRow", "ImageGrid"]
          },
          "name": { "type": "string" }
        },
        "required": ["id", "type", "name"]
      }
    },
    "lastModified": { "type": "string", "format": "date-time" },
    "version": { "type": "string" }
  },
  "required": ["components", "lastModified", "version"]
}
```

This guide shows you exactly how to view the JSON data your app sends to Contentful and how to structure your content so your second app can successfully fetch and use the layout data. 
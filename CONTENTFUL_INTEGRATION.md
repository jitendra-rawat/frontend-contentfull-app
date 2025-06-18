# Contentful Integration Guide

## 🎯 **How to Send JSON Data to Contentful CMS**

This guide explains how to save layout configuration from this Contentful app to your existing Contentful CMS and how to fetch it in your frontend.

## 📋 **Prerequisites**

1. ✅ Contentful account with a space
2. ✅ Landing page content type already created
3. ✅ This Contentful app deployed and configured

## 🔧 **Step 1: Configure Your Content Type**

In your existing Contentful space, ensure your **Landing Page** content type has a field configured like this:

### Field Configuration
```json
{
  "id": "layoutConfig",
  "name": "Layout Configuration", 
  "type": "Object",
  "required": false,
  "widgetId": "layout-editor"
}
```

**Important**: The `widgetId` must match your app's ID (`layout-editor`).

## 💾 **Step 2: How Data is Saved**

### Data Format Saved to Contentful
```json
{
  "components": [
    {
      "id": "hero-1234567890",
      "type": "HeroBlock",
      "name": "Hero Block"
    },
    {
      "id": "twoColumn-1234567891", 
      "type": "TwoColumnRow",
      "name": "Two Column Row"
    },
    {
      "id": "imageGrid-1234567892",
      "type": "ImageGrid", 
      "name": "2x2 Image Grid"
    }
  ],
  "lastModified": "2024-01-15T10:30:00.000Z",
  "version": "1.0"
}
```

### Automatic Saving
- ✅ **Auto-save**: Happens 1 second after any layout change
- ✅ **Manual save**: Click "💾 Save Layout" button
- ✅ **Retry logic**: 3 attempts with exponential backoff
- ✅ **Error handling**: User notifications for success/failure

## 📡 **Step 3: Fetch Data in Your Frontend**

### Option A: Using Contentful JavaScript SDK

```javascript
// Install: npm install contentful
import { createClient } from 'contentful';

const client = createClient({
  space: 'your-space-id',
  accessToken: 'your-access-token',
});

// Fetch landing page with layout config
async function getLandingPage(slug) {
  try {
    const response = await client.getEntries({
      content_type: 'landingPage',
      'fields.slug': slug,
      include: 2, // Include nested references
    });

    if (response.items.length > 0) {
      const page = response.items[0];
      const layoutConfig = page.fields.layoutConfig;
      
      if (layoutConfig && layoutConfig.components) {
        return {
          title: page.fields.title,
          slug: page.fields.slug,
          layout: layoutConfig.components,
          lastModified: layoutConfig.lastModified,
          version: layoutConfig.version
        };
      }
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

### Option B: Using Contentful GraphQL API

```javascript
// Install: npm install graphql-request
import { GraphQLClient, gql } from 'graphql-request';

const client = new GraphQLClient(
  'https://graphql.contentful.com/content/v1/spaces/your-space-id',
  {
    headers: {
      authorization: 'Bearer your-access-token',
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

### Option C: Using REST API

```javascript
async function getLandingPage(slug) {
  const spaceId = 'your-space-id';
  const accessToken = 'your-access-token';
  
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

## 🎨 **Step 4: Render Components in Your Frontend**

```javascript
// Component mapping
const componentMap = {
  HeroBlock: HeroComponent,
  TwoColumnRow: TwoColumnComponent,
  ImageGrid: ImageGridComponent,
};

// Render layout
function renderLayout(layout) {
  return layout.map((component, index) => {
    const Component = componentMap[component.type];
    
    if (!Component) {
      console.warn(`Unknown component type: ${component.type}`);
      return null;
    }
    
    return (
      <Component
        key={component.id}
        id={component.id}
        name={component.name}
        index={index}
      />
    );
  });
}

// Usage in your page component
function LandingPage({ pageData }) {
  if (!pageData || !pageData.layout) {
    return <div>No layout configured</div>;
  }

  return (
    <div className="landing-page">
      <h1>{pageData.title}</h1>
      <div className="layout-container">
        {renderLayout(pageData.layout)}
      </div>
    </div>
  );
}
```

## 🔄 **Step 5: Real-time Updates (Optional)**

For real-time updates when content changes:

```javascript
// Using Contentful Webhooks
// Configure webhook in Contentful to call your API when content changes

// In your API route
app.post('/api/contentful-webhook', (req, res) => {
  const { sys, fields } = req.body;
  
  if (sys.contentType.sys.id === 'landingPage') {
    // Trigger rebuild or cache invalidation
    console.log('Landing page updated:', fields.slug);
    
    // Example: Trigger Next.js rebuild
    // fetch('/api/revalidate?slug=' + fields.slug);
  }
  
  res.status(200).send('OK');
});
```

## 🚀 **Deployment Checklist**

### Contentful App
- [ ] Deploy app to hosting (Vercel, Netlify, etc.)
- [ ] Update `contentful-app.json` with production URL
- [ ] Install app in Contentful space
- [ ] Configure field to use the app

### Frontend Integration
- [ ] Add Contentful SDK/API client
- [ ] Implement data fetching logic
- [ ] Create component mapping
- [ ] Add error handling
- [ ] Test with real data

## 🐛 **Troubleshooting**

### Common Issues

1. **App not saving data**
   - Check browser console for errors
   - Verify field permissions in Contentful
   - Ensure app is properly installed

2. **Data not loading in frontend**
   - Verify access token permissions
   - Check content type and field names
   - Ensure proper error handling

3. **Layout not rendering**
   - Verify component mapping
   - Check for missing components
   - Validate JSON structure

### Debug Commands

```javascript
// Check what's saved in Contentful
console.log('Current field value:', await sdk.field.getValue());

// Check app configuration
console.log('App config:', sdk.app);
```

## 📊 **Data Structure Reference**

### Component Types
```typescript
interface ComponentConfig {
  id: string;
  type: 'HeroBlock' | 'TwoColumnRow' | 'ImageGrid';
  name: string;
}
```

### Saved Data Structure
```typescript
interface LayoutConfig {
  components: ComponentConfig[];
  lastModified: string;
  version: string;
}
```

This setup ensures your Contentful app saves structured JSON data that your frontend can easily consume and render! 
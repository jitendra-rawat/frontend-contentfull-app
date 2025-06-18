# Local Development Guide

## ✅ **Fixed Issues**
- ✅ No more "Cannot use App SDK outside of Contentful" errors
- ✅ Redux persist warnings resolved
- ✅ react-beautiful-dnd configuration fixed
- ✅ Mock SDK with comprehensive functionality
- ✅ Development mode indicator
- ✅ Sample data for testing

## 🆕 **New Features**
- ✅ Component palette for adding new components
- ✅ Delete functionality for removing components
- ✅ Enhanced drag and drop with visual feedback
- ✅ Improved styling and animations

## Quick Start

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Access the App
- **Main page**: http://localhost:3000
- **Editor**: http://localhost:3000/editor

### 3. Set up Contentful (One-time setup)
```bash
# Login to Contentful
npm run contentful:login

# Select your space
npm run contentful:space:use

# Create the app in Contentful
npm run contentful:app:create
```

### 4. Deploy App to Contentful
```bash
npm run contentful:app:deploy
```

## Development Features

### 🛠️ **Development Mode Indicator**
- Red badge in top-right corner when running locally
- Shows "🛠️ Development Mode" indicator

### 📊 **Mock SDK Operations**
All SDK operations are logged to console:
- `Mock: Getting field value`
- `Mock: Setting field value to: [...]`
- `Mock: Auto resizer started`
- `Mock Success/Error/Warning: [message]`

### 🎯 **Sample Data**
- Automatically loads sample layout in development
- 3 components: Hero Block, Two Column Row, Image Grid
- Ready for drag-and-drop testing

### 🎨 **Component Palette**
- Add new components to the layout
- Three component types available
- Visual preview of each component type
- Click to add to layout

### 🗑️ **Delete Functionality**
- Delete button (×) on each component
- Removes component from layout
- Updates Redux state immediately

### 🔄 **Enhanced Drag & Drop**
- Visual feedback during dragging
- Smooth animations and transitions
- Proper react-beautiful-dnd configuration
- No more setup warnings

### 🔄 **Full Functionality**
- ✅ Drag and drop reordering
- ✅ Undo/Redo operations
- ✅ Autosave simulation
- ✅ Preview button (opens in new tab)
- ✅ Redux state management
- ✅ Add new components
- ✅ Delete existing components

## Environment Variables

Create `.env.local` with:
```
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_ACCESS_TOKEN=your_access_token
CONTENTFUL_ENVIRONMENT=master
```

## Testing Workflow

### Local Development
1. Run `npm run dev`
2. Visit `http://localhost:3000/editor`
3. See sample data loaded automatically
4. Test drag-and-drop functionality
5. Use undo/redo buttons
6. Add new components from palette
7. Delete components with × button
8. Check console for mock operations

### Contentful Integration
1. Deploy with `npm run contentful:app:deploy`
2. Go to Contentful → Apps → Your App
3. Install the app on a content type
4. Test the full SDK functionality

## Troubleshooting

### ❌ "Cannot use App SDK outside of Contentful"
**Status**: ✅ **FIXED**
- The app now detects development mode
- Uses comprehensive mock SDK
- No more errors in console

### ⚠️ Redux persist warnings
**Status**: ✅ **FIXED**
- Added serializable check configuration
- Warnings suppressed for persist actions

### 🎯 react-beautiful-dnd setup warnings
**Status**: ✅ **FIXED**
- Added proper `isDropDisabled` prop
- Added `isDragDisabled` prop
- Enhanced visual feedback

### 🔧 App not loading in Contentful
1. Check your app is deployed: `npm run contentful:app:deploy`
2. Verify the app is installed on your content type
3. Check the app URL in Contentful matches your deployment

### 🌐 CORS Issues
- For localhost development, ensure your browser allows mixed content
- Disable mixed content protection in Firefox and Chrome for localhost

## Mock SDK Features

When running locally, the app uses a comprehensive mock SDK:

### Field Operations
- `getValue()` - Returns `'[]'` and logs operation
- `setValue(value)` - Logs the value being set
- `onValueChanged(callback)` - Registers change listeners

### Window Operations
- `startAutoResizer()` - Logs auto-resizer start
- `stopAutoResizer()` - Logs auto-resizer stop

### Entry Operations
- `getSys()` - Returns mock entry ID and version
- `onSysChanged(callback)` - Registers sys change listeners

### Space Operations
- `getEntry(id)` - Returns mock entry data

### Notifier Operations
- `success(message)` - Logs success messages
- `error(message)` - Logs error messages
- `warning(message)` - Logs warning messages

## Next Steps

1. **Test locally** - Ensure all functionality works
2. **Deploy to Contentful** - Use the CLI commands
3. **Install on content type** - Add to your LandingPage content type
4. **Test in Contentful** - Verify full SDK functionality
5. **Deploy to production** - Use Vercel or your preferred hosting 
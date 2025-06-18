# Contentful Layout Editor App

A drag & drop layout builder for Contentful that allows content editors to create dynamic page layouts and save them as JSON configuration.

## Features

- 🎨 **Drag & Drop Interface**: Intuitive visual layout builder
- 📦 **Component Palette**: Pre-built components (Hero Block, Two Column Row, Image Grid)
- 🔄 **Undo/Redo**: Full history management with undo/redo functionality
- 💾 **Auto-save**: Automatic saving to Contentful with debouncing
- 👀 **Preview**: Preview layouts in development mode
- 🗑️ **Component Management**: Add, remove, and reorder components

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Development Mode
```bash
npm run dev
```

The app will be available at `http://localhost:3000/editor`

### 3. Contentful Integration

#### Create the App in Contentful
```bash
# Login to Contentful
npm run contentful:login

# Select your space
npm run contentful:space:use

# Create the app
npm run contentful:app:create

# Deploy the app
npm run contentful:app:deploy
```

#### Configure Content Model
1. Create a new content type (e.g., "Landing Page")
2. Add a field of type "Object" (JSON)
3. Configure the field to use this app
4. The app will save layout configuration as JSON to this field

## How It Works

### Contentful App (This Repository)
- **Editor Interface**: Drag & drop layout builder
- **Redux State Management**: Handles layout state, undo/redo, autosave
- **Contentful SDK**: Saves layout configuration as JSON to Contentful
- **Component System**: Modular components that can be arranged

### Frontend App (Separate Repository)
- **Static Site Generation**: Next.js builds pages from Contentful data
- **Layout Rendering**: Reads JSON configuration and renders components
- **Dynamic Content**: Fetches referenced content entries

## Data Flow

```
[Editor] → [Contentful App] → [Contentful CMS] → [Frontend App] → [Rendered Page]
   ↓           ↓                    ↓                ↓              ↓
Drag & Drop → Save JSON → Store Layout Config → Fetch & Render → Static Page
```

## Component Types

- **HeroBlock**: Full-width hero section
- **TwoColumnRow**: Two-column layout (text + image)
- **ImageGrid**: 2x2 image grid layout

## Development

### Adding New Components
1. Update `ComponentConfig` type in `src/app/lib/types.ts`
2. Add component to `availableComponents` array in `ComponentPalette.tsx`
3. Add preview rendering in `ComponentPreview.tsx`
4. Add thumbnail in `ComponentPalette.tsx`

### Styling
- Main styles: `src/app/styles/DragDrop.module.css`
- Component-specific styles can be added as needed

## Environment Variables

- `NEXT_PUBLIC_FRONTEND_URL`: URL of your frontend app for preview functionality

## Troubleshooting

### App Not Loading in Contentful
- Ensure the app is properly deployed: `npm run contentful:app:deploy`
- Check that the field type is set to "Object" (JSON)
- Verify the app URL in Contentful matches your deployment

### Layout Not Saving
- Check browser console for errors
- Verify Contentful SDK initialization
- Ensure field permissions are correct

### Preview Not Working
- Set `NEXT_PUBLIC_FRONTEND_URL` environment variable
- Ensure frontend app is deployed and accessible 
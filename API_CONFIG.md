# API Configuration - Centralized Setup

## Overview
The API base URL is now centralized in a single location: `src/lib/api.ts`

## Configuration File

**Location:** `src/lib/api.ts`

```typescript
export const API_BASE_URL =
    process.env.NODE_ENV === "development"
        ? "http://localhost:8000"
        : process.env.REACT_APP_API_URL || "http://212.85.25.109:8000";
```

## How It Works

### Development Mode
- Automatically uses `http://localhost:8000`
- No configuration needed for local development

### Production Mode
1. **With Environment Variable** (Recommended):
   - Set `REACT_APP_API_URL` in your `.env` file
   - Example: `REACT_APP_API_URL=https://api.yourapp.com`
   
2. **Without Environment Variable** (Fallback):
   - Uses the hardcoded default: `http://212.85.25.109:8000`

## Setup Instructions

### For Local Development
No setup required! Just run:
```bash
npm start
```

### For Production Deployment

1. **Create `.env` file** (or use your deployment platform's environment variables):
```bash
REACT_APP_API_URL=https://your-backend-api.com
```

2. **Build the app**:
```bash
npm run build
```

3. **Deploy**: The built app will use your configured API URL

## Files Using Central Configuration

All API calls now import from `src/lib/api.ts`:

✅ `src/components/Dashboard.tsx` - Video merge operations
✅ `src/components/TranscriptTab.tsx` - Transcript fetching
✅ `src/components/HistoryDialog.tsx` - Merge history
✅ `src/login/page.tsx` - Login endpoint
✅ `src/signup/page.tsx` - Registration endpoint
✅ `src/components/GoogleLoginButton.tsx` - Google OAuth

## Benefits

1. **Single Source of Truth**: Change API URL in one place
2. **Environment-Aware**: Automatically adapts to dev/prod
3. **Flexible**: Override with environment variables
4. **Easy Testing**: Switch between different backend servers easily

## Example Usage

```typescript
import { API_BASE_URL } from "@/lib/api";

// Use in any component or service
const response = await fetch(`${API_BASE_URL}/api/endpoint`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data)
});
```

## Troubleshooting

### API calls failing in production?
1. Check that `REACT_APP_API_URL` is set correctly
2. Verify the API server is accessible from the client
3. Check CORS settings on your backend

### Using a different port in development?
Update `src/lib/api.ts` to change the localhost port:
```typescript
? "http://localhost:YOUR_PORT"
```

### Need different APIs for staging/production?
Use different environment variables:
- `.env.staging` → `REACT_APP_API_URL=https://staging-api.com`
- `.env.production` → `REACT_APP_API_URL=https://api.com`

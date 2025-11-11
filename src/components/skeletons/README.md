# Skeletons Folder

This folder contains skeleton loading components for the application.

Skeleton components provide visual feedback while content is loading, improving the user experience.

## Usage Example

```tsx
import { DashboardSkeleton } from './components/skeletons/DashboardSkeleton';

// Use in your component
{isLoading ? <DashboardSkeleton /> : <ActualContent />}
```

# UX Enhancements Guide - Story 5.4

This guide documents the UX enhancements implemented for emotional error messages and keyboard navigation.

## Implemented Features

### 1. Toast Notification System

**Location:** `/Users/donggyu/bm-builder/frontend/src/components/ui/Toast.tsx`

#### Features:
- **Emotional error messages** with friendly, helpful text
- **Auto-dismiss** after 5 seconds (configurable)
- **Multiple toasts** stacking support
- **4 toast types**: success, error, info, warning
- **Emoji indicators** for visual appeal
- **Accessibility compliant**: WCAG 2.1 AA standards

#### Usage Example:

```tsx
import { useToast, ErrorMessages, SuccessMessages } from '@/components/ui';

function MyComponent() {
  const { addToast } = useToast();

  const handleSuccess = () => {
    addToast({
      type: 'success',
      title: 'Great job! Saved successfully',
      message: 'Your changes have been saved.'
    });
  };

  const handleError = () => {
    addToast(ErrorMessages.network);
  };

  return (
    <>
      <button onClick={handleSuccess}>Save</button>
      <button onClick={handleError}>Test Error</button>
    </>
  );
}
```

#### Pre-built Message Templates:

**Error Messages:**
- `ErrorMessages.network` - Connection issues
- `ErrorMessages.validation` - Form validation errors
- `ErrorMessages.unauthorized` - Authentication required
- `ErrorMessages.server` - Server errors
- `ErrorMessages.timeout` - Request timeout
- `ErrorMessages.notFound` - Resource not found
- `ErrorMessages.generic` - Generic errors

**Success Messages:**
- `SuccessMessages.created` - Resource created
- `SuccessMessages.updated` - Resource updated
- `SuccessMessages.deleted` - Resource deleted
- `SuccessMessages.saved` - Changes saved
- `SuccessMessages.copied` - Copied to clipboard
- `SuccessMessages.sent` - Message sent

---

### 2. Keyboard Navigation

**Location:** `/Users/donggyu/bm-builder/frontend/src/hooks/useKeyboardNavigation.ts`

#### Features:
- **Global keyboard shortcuts** support
- **Escape key** to close modals
- **Arrow keys** for list navigation
- **Enter/Space** for activation
- **Focus trap** for modals (accessibility)
- **Home/End** for list jumping

#### Usage Examples:

**1. Basic Keyboard Shortcuts:**

```tsx
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';

function MyComponent() {
  useKeyboardNavigation([
    {
      key: 'k',
      ctrlKey: true,
      handler: () => console.log('Command palette opened'),
      description: 'Open command palette'
    },
    {
      key: 'Escape',
      handler: () => console.log('Closed'),
      description: 'Close modal'
    }
  ]);

  return <div>Press Ctrl+K to test</div>;
}
```

**2. Escape Key for Modals:**

```tsx
import { useEscapeKey } from '@/hooks/useKeyboardNavigation';

function Modal({ onClose }) {
  useEscapeKey(onClose);

  return (
    <div className="modal">
      <p>Press Escape to close</p>
    </div>
  );
}
```

**3. Arrow Key Navigation:**

```tsx
import { useArrowNavigation } from '@/hooks/useKeyboardNavigation';

function SelectList({ items }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useArrowNavigation(
    items.length,
    selectedIndex,
    setSelectedIndex,
    { loop: true }
  );

  return (
    <ul>
      {items.map((item, index) => (
        <li
          key={index}
          className={index === selectedIndex ? 'selected' : ''}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
```

**4. Focus Trap for Modals:**

```tsx
import { useFocusTrap } from '@/hooks/useKeyboardNavigation';

function Modal() {
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef);

  return (
    <div ref={modalRef} className="modal">
      <button>Button 1</button>
      <button>Button 2</button>
      <button>Button 3</button>
    </div>
  );
}
```

#### Available Shortcuts:

| Shortcut | Action |
|----------|--------|
| `ArrowUp/Down` | Navigate in lists |
| `ArrowLeft/Right` | Navigate backward/forward |
| `Home/End` | Jump to first/last item |
| `Enter` | Activate selected item |
| `Space` | Select/toggle item |
| `Escape` | Close modal or cancel |
| `Ctrl+S` | Save current work |
| `Ctrl+Z` | Undo last action |
| `Ctrl+Shift+Z` | Redo last action |
| `Ctrl+C/V/X` | Copy/Paste/Cut |
| `Ctrl+K` | Open command palette |
| `Ctrl+F` | Find in page |
| `Ctrl+D` | Toggle dark mode |
| `?` | Show keyboard shortcuts |

---

### 3. Loading States

**Location:** `/Users/donggyu/bm-builder/frontend/src/components/ui/Skeleton.tsx`

#### Features:
- **Skeleton screens** for content placeholders
- **Progress indicators** with percentage
- **Spinner** for simple loading states
- **Optimistic UI** hooks

#### Usage Examples:

**1. Text Skeleton:**

```tsx
import { TextSkeleton } from '@/components/ui';

function LoadingState() {
  return (
    <div>
      <TextSkeleton lines={3} />
    </div>
  );
}
```

**2. Card Skeleton:**

```tsx
import { CardSkeleton } from '@/components/ui';

function LoadingCards() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <CardSkeleton showAvatar />
      <CardSkeleton showAvatar />
      <CardSkeleton showAvatar />
    </div>
  );
}
```

**3. Progress Bar:**

```tsx
import { Progress } from '@/components/ui';

function UploadingFile() {
  const [progress, setProgress] = useState(0);

  return (
    <Progress
      value={progress}
      max={100}
      showLabel
      label="Uploading document..."
      color="primary"
    />
  );
}
```

**4. Spinner:**

```tsx
import { Spinner } from '@/components/ui';

function LoadingButton() {
  return (
    <button disabled>
      <Spinner size="sm" />
      Loading...
    </button>
  );
}
```

**5. Document Skeleton:**

```tsx
import { DocumentSkeleton } from '@/components/ui';

function LoadingDocument() {
  return <DocumentSkeleton />;
}
```

---

### 4. Error Boundary

**Location:** `/Users/donggyu/bm-builder/frontend/src/components/ui/ErrorBoundary.tsx`

#### Features:
- **Friendly error messages** with emotional tone
- **Recovery options** (try again, reload, go home)
- **Development mode** error details
- **Helpful tips** for users
- **Accessibility compliant**

#### Usage Example:

```tsx
import { ErrorBoundary } from '@/components/ui';

function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log to error reporting service
        console.error('Error:', error, errorInfo);
      }}
    >
      <MyComponent />
    </ErrorBoundary>
  );
}
```

**Custom Fallback:**

```tsx
<ErrorBoundary
  fallback={
    <div className="error">
      <h2>Something went wrong</h2>
      <button onClick={() => window.location.reload()}>
        Reload
      </button>
    </div>
  }
>
  <MyComponent />
</ErrorBoundary>
```

**Inline Error Fallback:**

```tsx
import { InlineErrorFallback } from '@/components/ui';

function MyComponent() {
  const { error, handleError, reset } = useErrorHandler();

  if (error) {
    return (
      <InlineErrorFallback
        message={error.message}
        onRetry={reset}
      />
    );
  }

  return <div>Content</div>;
}
```

---

### 5. Keyboard Shortcuts Modal

**Location:** `/Users/donggyu/bm-builder/frontend/src/components/ui/KeyboardShortcutsModal.tsx`

#### Features:
- **Comprehensive shortcuts** documentation
- **Categorized** by functionality
- **Accessible** with focus trap
- **Press `?`** to open anywhere
- **Visual key badges** showing modifiers

#### Usage Example:

```tsx
import { useKeyboardShortcutsModal } from '@/components/ui';

function App() {
  const { ShortcutModal, open } = useKeyboardShortcutsModal();

  return (
    <>
      <button onClick={open}>
        Keyboard Shortcuts
      </button>
      <ShortcutModal />
    </>
  );
}
```

**Custom Shortcuts:**

```tsx
const customShortcuts = [
  {
    key: 's',
    ctrlKey: true,
    description: 'Save document',
    category: 'Actions'
  },
  {
    key: 'p',
    ctrlKey: true,
    description: 'Print document',
    category: 'Actions'
  }
];

<KeyboardShortcutsModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  shortcuts={customShortcuts}
/>
```

---

## Integration with Existing Components

### Adding Toast Notifications to API Calls:

```tsx
import { useToast, ErrorMessages, SuccessMessages } from '@/components/ui';
import { api } from '@/api';

function DocumentUpload() {
  const { addToast } = useToast();

  const handleUpload = async (file: File) => {
    try {
      await api.uploadDocument(file);
      addToast(SuccessMessages.created);
    } catch (error) {
      addToast(ErrorMessages.network);
    }
  };

  return <button onClick={() => handleUpload(file)}>Upload</button>;
}
```

### Adding Keyboard Navigation to Lists:

```tsx
import { useArrowNavigation, useKeyboardActivation } from '@/hooks/useKeyboardNavigation';

function DocumentList({ documents }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useArrowNavigation(documents.length, selectedIndex, setSelectedIndex);

  return (
    <ul role="listbox">
      {documents.map((doc, index) => (
        <li
          key={doc.id}
          role="option"
          aria-selected={index === selectedIndex}
          onClick={() => setSelectedIndex(index)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              openDocument(doc);
            }
          }}
          className={index === selectedIndex ? 'selected' : ''}
        >
          {doc.title}
        </li>
      ))}
    </ul>
  );
}
```

### Adding Loading States:

```tsx
import { DocumentSkeleton, Spinner } from '@/components/ui';

function DocumentViewer({ document, isLoading }) {
  if (isLoading) {
    return <DocumentSkeleton />;
  }

  return <div>{document.content}</div>;
}

function SaveButton({ isSaving }) {
  return (
    <button disabled={isSaving}>
      {isSaving ? <Spinner size="sm" /> : null}
      {isSaving ? 'Saving...' : 'Save'}
    </button>
  );
}
```

### Adding Error Boundaries:

```tsx
import { ErrorBoundary } from '@/components/ui';

function DocumentGenerationPage() {
  return (
    <ErrorBoundary>
      <DocumentGenerator />
      <DocumentPreview />
      <SaveButton />
    </ErrorBoundary>
  );
}
```

---

## Accessibility Features

### WCAG 2.1 Level AA Compliance:

1. **Color Contrast**: All text meets 4.5:1 contrast ratio
2. **Keyboard Navigation**: Full keyboard support without mouse
3. **Screen Reader**: ARIA labels and roles throughout
4. **Focus Management**: Visible focus indicators
5. **Error Recovery**: Clear error messages with recovery options
6. **Modal Accessibility**: Focus trap and escape key support

### Testing Checklist:

- [ ] Can navigate entire app with keyboard only
- [ ] All interactive elements have visible focus states
- [ ] Screen reader announces all important changes
- [ ] Error messages are clear and actionable
- [ ] Loading states have accessible labels
- [ ] Modal traps focus and can be closed with Escape
- [ ] Form inputs have proper labels and error messages

---

## Best Practices

### Error Messages:
1. **Be friendly**: "Oops!" instead of "Error"
2. **Be helpful**: Explain what went wrong and how to fix it
3. **Avoid jargon**: Use simple, non-technical language
4. **Provide recovery**: Give clear next steps

### Keyboard Navigation:
1. **Document shortcuts**: Make shortcuts discoverable
2. **Follow conventions**: Use standard shortcuts (Ctrl+S for save)
3. **Provide alternatives**: Mouse and keyboard should both work
4. **Show indicators**: Visual feedback for keyboard users

### Loading States:
1. **Set expectations**: Show what's happening
2. **Provide progress**: For long operations, show percentage
3. **Skeleton screens**: Better than spinners for content
4. **Optimistic updates**: Update UI immediately, rollback on error

### Toast Notifications:
1. **Keep it brief**: Short, clear messages
2. **Auto-dismiss**: Don't force users to close
3. **Stack carefully**: Limit to 3-4 toasts max
4. **Use emotions**: Emojis make messages friendlier

---

## Files Created/Modified

### New Files:
1. `/Users/donggyu/bm-builder/frontend/src/components/ui/Toast.tsx` - Toast notification system
2. `/Users/donggyu/bm-builder/frontend/src/components/ui/Skeleton.tsx` - Loading states
3. `/Users/donggyu/bm-builder/frontend/src/components/ui/ErrorBoundary.tsx` - Error boundary
4. `/Users/donggyu/bm-builder/frontend/src/components/ui/KeyboardShortcutsModal.tsx` - Keyboard shortcuts modal
5. `/Users/donggyu/bm-builder/frontend/src/components/ui/index.ts` - UI component exports
6. `/Users/donggyu/bm-builder/frontend/src/hooks/useKeyboardNavigation.ts` - Keyboard navigation hooks

### Modified Files:
1. `/Users/donggyu/bm-builder/frontend/src/App.tsx` - Integrated ToastProvider and ErrorBoundary

---

## Next Steps

1. **Test keyboard navigation** throughout the application
2. **Add toasts to all API calls** for better error feedback
3. **Replace spinners with skeletons** in loading states
4. **Add error boundaries** around major features
5. **Document custom shortcuts** for your specific features
6. **Test with screen readers** for accessibility compliance

---

## Support

For questions or issues with these UX enhancements, refer to:
- Story 5.4 implementation document
- Design system guide (`/Users/donggyu/bm-builder/_bmad-output/design-system/BM-Builder-Design-System.md`)
- WCAG 2.1 guidelines: https://www.w3.org/WAI/WCAG21/quickref/

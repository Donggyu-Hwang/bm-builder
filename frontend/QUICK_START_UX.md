# Quick Start Guide - UX Enhancements

Learn how to use the new UX features in 5 minutes!

## 🎯 Toast Notifications

### Basic Usage

```tsx
import { useToast } from '@/components/ui';

function MyComponent() {
  const { addToast } = useToast();

  const handleClick = () => {
    addToast({
      type: 'success',
      title: 'Great job!',
      message: 'Your changes have been saved.'
    });
  };

  return <button onClick={handleClick}>Save</button>;
}
```

### Pre-built Messages

```tsx
import { ErrorMessages, SuccessMessages } from '@/components/ui';

// Error messages
addToast(ErrorMessages.network);      // Connection issues
addToast(ErrorMessages.validation);   // Form validation
addToast(ErrorMessages.server);       // Server errors

// Success messages
addToast(SuccessMessages.saved);      // Saved successfully
addToast(SuccessMessages.created);    // Resource created
```

---

## ⌨️ Keyboard Navigation

### Arrow Keys in Lists

```tsx
import { useArrowNavigation } from '@/hooks/useKeyboardNavigation';

function MyList({ items }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useArrowNavigation(items.length, selectedIndex, setSelectedIndex);

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

### Escape Key for Modals

```tsx
import { useEscapeKey } from '@/hooks/useKeyboardNavigation';

function Modal({ onClose }) {
  useEscapeKey(onClose);
  return <div>Press Escape to close</div>;
}
```

### Focus Trap (Accessibility)

```tsx
import { useFocusTrap } from '@/hooks/useKeyboardNavigation';

function Modal() {
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef);

  return (
    <div ref={modalRef} tabIndex={-1}>
      <button>Button 1</button>
      <button>Button 2</button>
    </div>
  );
}
```

---

## 💀 Loading States

### Skeleton Screens

```tsx
import { TextSkeleton, CardSkeleton, ListSkeleton } from '@/components/ui';

// Text skeleton
<TextSkeleton lines={3} />

// Card skeleton
<CardSkeleton showAvatar />

// List skeleton
<ListSkeleton items={5} />
```

### Progress Bar

```tsx
import { Progress } from '@/components/ui';

<Progress
  value={75}
  max={100}
  showLabel
  label="Uploading..."
  color="primary"
/>
```

### Spinner

```tsx
import { Spinner } from '@/components/ui';

<Spinner size="md" />
```

---

## ⚠️ Error Boundary

### Basic Usage

```tsx
import { ErrorBoundary } from '@/components/ui';

function App() {
  return (
    <ErrorBoundary>
      <MyComponent />
    </ErrorBoundary>
  );
}
```

### With Custom Fallback

```tsx
<ErrorBoundary
  fallback={
    <div>
      <h2>Something went wrong</h2>
      <button onClick={() => window.location.reload()}>Reload</button>
    </div>
  }
>
  <MyComponent />
</ErrorBoundary>
```

### Error Handler Hook

```tsx
import { useErrorHandler } from '@/components/ui';

function MyComponent() {
  const { error, handleError, reset } = useErrorHandler();

  if (error) {
    return (
      <div>
        <p>Oops! {error.message}</p>
        <button onClick={reset}>Try again</button>
      </div>
    );
  }

  return <div>Content</div>;
}
```

---

## ⌨️ Keyboard Shortcuts

### Show Shortcuts Modal

```tsx
import { useKeyboardShortcutsModal } from '@/components/ui';

function App() {
  const { ShortcutModal, open } = useKeyboardShortcutsModal();

  return (
    <>
      <button onClick={open}>Keyboard Shortcuts (?)</button>
      <ShortcutModal />
    </>
  );
}
```

### Press `?` Anywhere

The keyboard shortcuts modal automatically opens when you press `?` anywhere in the app!

---

## 🎨 Complete Example: Document List

```tsx
import { useState } from 'react';
import { useToast, ErrorMessages } from '@/components/ui';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { useArrowNavigation } from '@/hooks/useKeyboardNavigation';

function DocumentList() {
  const { addToast } = useToast();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Keyboard navigation
  useArrowNavigation(documents.length, selectedIndex, setSelectedIndex, {
    loop: true
  });

  // Load documents
  useEffect(() => {
    fetchDocuments()
      .then((docs) => setDocuments(docs))
      .catch(() => addToast(ErrorMessages.network))
      .finally(() => setLoading(false));
  }, []);

  // Handle selection
  const handleSelect = (doc) => {
    setSelectedIndex(documents.indexOf(doc));
    addToast({
      type: 'info',
      title: 'Document selected',
      message: doc.name
    });
  };

  if (loading) return <ListSkeleton items={3} />;

  return (
    <ul role="listbox">
      {documents.map((doc, index) => (
        <li
          key={doc.id}
          onClick={() => handleSelect(doc)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleSelect(doc);
            }
          }}
          className={index === selectedIndex ? 'selected' : ''}
        >
          {doc.name}
        </li>
      ))}
    </ul>
  );
}
```

---

## 📋 Common Patterns

### API Call with Toast

```tsx
const handleSave = async () => {
  try {
    await api.save(data);
    addToast(SuccessMessages.saved);
  } catch (error) {
    addToast(ErrorMessages.server);
  }
};
```

### Loading Button

```tsx
<button disabled={loading}>
  {loading ? <Spinner size="sm" /> : null}
  {loading ? 'Saving...' : 'Save'}
</button>
```

### Form Validation

```tsx
const handleSubmit = () => {
  if (!isValid) {
    addToast(ErrorMessages.validation);
    return;
  }
  // Submit form
};
```

---

## ✅ Accessibility Checklist

When building components:

- [ ] Use semantic HTML (`button`, `input`, `ul`, `li`)
- [ ] Add ARIA labels (`aria-label`, `aria-selected`)
- [ ] Add keyboard event handlers (`onKeyDown`)
- [ ] Show focus indicators (`focus:ring-2`)
- [ ] Add loading states for async operations
- [ ] Provide error recovery options
- [ ] Use toasts for user feedback

---

## 🚀 Pro Tips

1. **Use pre-built message templates** - Don't write custom error messages
2. **Add keyboard navigation to all lists** - Users love it!
3. **Use skeletons instead of spinners** - Better perceived performance
4. **Add error boundaries around routes** - Prevent white screen of death
5. **Document your shortcuts** - Use the shortcuts modal
6. **Test with keyboard only** - Uncover accessibility issues early

---

## 📚 Full Documentation

See `/Users/donggyu/bm-builder/frontend/UX_ENHANCEMENTS_GUIDE.md` for comprehensive documentation.

---

**Happy coding! 🎉**

/**
 * Accessibility Testing Utilities
 * Helper functions for testing WCAG 2.1 Level AA compliance
 */

import { checkContrast, calculateContrastRatio } from './accessibility';

export interface AccessibilityIssue {
  type: 'contrast' | 'aria' | 'keyboard' | 'semantics' | 'focus';
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  element: string;
  description: string;
  wcagCriterion: string;
}

/**
 * Check color contrast for text elements
 */
export function checkTextContrast(element: HTMLElement): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  const styles = window.getComputedStyle(element);
  const color = styles.color;
  const backgroundColor = styles.backgroundColor;

  // Skip if no background color (transparent)
  if (backgroundColor === 'transparent' || backgroundColor === 'rgba(0, 0, 0, 0)') {
    return issues;
  }

  const fontSize = parseFloat(styles.fontSize);
  const fontWeight = parseInt(styles.fontWeight);
  const isLargeText = fontSize >= 18 || (fontSize >= 14 && fontWeight >= 700);

  const { passes, ratio, required } = checkContrast(
    color,
    backgroundColor,
    isLargeText
  );

  if (!passes) {
    issues.push({
      type: 'contrast',
      severity: 'serious',
      element: element.tagName.toLowerCase() + (element.className ? '.' + element.className : ''),
      description: `Contrast ratio is ${ratio}:1, which is below the WCAG AA requirement of ${required}:1 for ${isLargeText ? 'large' : 'normal'} text`,
      wcagCriterion: '1.4.3 Contrast (Minimum) (Level AA)',
    });
  }

  return issues;
}

/**
 * Check for ARIA labels on interactive elements
 */
export function checkAriaLabels(root: HTMLElement = document.body): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  const interactiveSelectors = [
    'button:not([aria-label]):not([aria-labelledby])',
    'a[href]:not([aria-label]):not([aria-labelledby])',
    '[role="button"]:not([aria-label]):not([aria-labelledby])',
    'input[type="submit"]:not([aria-label]):not([aria-labelledby])',
  ];

  interactiveSelectors.forEach((selector) => {
    const elements = root.querySelectorAll(selector);
    elements.forEach((element) => {
      const text = element.textContent?.trim();
      const hasTitle = element.getAttribute('title');
      const hasAriaLabel = element.getAttribute('aria-label') || element.getAttribute('aria-labelledby');

      if (!text && !hasTitle && !hasAriaLabel) {
        issues.push({
          type: 'aria',
          severity: 'serious',
          element: element.tagName.toLowerCase(),
          description: 'Interactive element lacks accessible name. Add aria-label, aria-labelledby, or visible text.',
          wcagCriterion: '2.5.3 Label in Name (Level A)',
        });
      }
    });
  });

  return issues;
}

/**
 * Check for proper heading hierarchy
 */
export function checkHeadingHierarchy(root: HTMLElement = document.body): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  const headings = root.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let previousLevel = 0;

  headings.forEach((heading) => {
    const currentLevel = parseInt(heading.tagName[1]);

    // Check for skipped heading levels
    if (currentLevel > previousLevel + 1 && previousLevel !== 0) {
      issues.push({
        type: 'semantics',
        severity: 'moderate',
        element: heading.tagName.toLowerCase(),
        description: `Heading level skipped from h${previousLevel} to h${currentLevel}. Use sequential heading levels.`,
        wcagCriterion: '1.3.1 Info and Relationships (Level A)',
      });
    }

    previousLevel = currentLevel;
  });

  // Check for multiple h1s
  const h1s = root.querySelectorAll('h1');
  if (h1s.length > 1) {
    issues.push({
      type: 'semantics',
      severity: 'moderate',
      element: 'h1',
      description: `Multiple h1 elements found (${h1s.length}). Use only one h1 per page.`,
      wcagCriterion: '1.3.1 Info and Relationships (Level A)',
    });
  }

  return issues;
}

/**
 * Check for form labels
 */
export function checkFormLabels(root: HTMLElement = document.body): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  const formInputs = root.querySelectorAll('input, textarea, select');

  formInputs.forEach((input) => {
    const hasLabel = input.hasAttribute('aria-label') ||
                     input.hasAttribute('aria-labelledby') ||
                     document.querySelector(`label[for="${input.id}"]`);

    if (!hasLabel && input.type !== 'hidden' && input.type !== 'submit' && input.type !== 'button') {
      issues.push({
        type: 'aria',
        severity: 'critical',
        element: input.tagName.toLowerCase() + (input.getAttribute('type') ? `[type="${input.getAttribute('type')}"]` : ''),
        description: 'Form input lacks accessible label. Add a label element or aria-label.',
        wcagCriterion: '1.3.1 Info and Relationships (Level A)',
      });
    }
  });

  return issues;
}

/**
 * Check for alt text on images
 */
export function checkImageAltText(root: HTMLElement = document.body): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  const images = root.querySelectorAll('img');

  images.forEach((img) => {
    const alt = img.getAttribute('alt');
    if (alt === null) {
      issues.push({
        type: 'aria',
        severity: 'serious',
        element: 'img[src="' + img.getAttribute('src') + '"]',
        description: 'Image missing alt attribute. Add alt text or alt="" for decorative images.',
        wcagCriterion: '1.1.1 Non-text Content (Level A)',
      });
    }
  });

  return issues;
}

/**
 * Check for visible focus indicators
 */
export function checkFocusIndicators(root: HTMLElement = document.body): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  const interactiveElements = root.querySelectorAll(
    'a[href], button, [role="button"], input, textarea, select, [tabindex]:not([tabindex="-1"])'
  );

  interactiveElements.forEach((element) => {
    const styles = window.getComputedStyle(element);
    const outlineWidth = parseInt(styles.outlineWidth);
    const outlineStyle = styles.outlineStyle;

    if (outlineWidth === 0 || outlineStyle === 'none') {
      issues.push({
        type: 'focus',
        severity: 'serious',
        element: element.tagName.toLowerCase(),
        description: 'Interactive element lacks visible focus indicator. Add outline or focus-visible styles.',
        wcagCriterion: '2.4.7 Focus Visible (Level AA)',
      });
    }
  });

  return issues;
}

/**
 * Run all accessibility checks
 */
export function runAccessibilityChecks(root: HTMLElement = document.body): AccessibilityIssue[] {
  const allIssues: AccessibilityIssue[] = [
    ...checkAriaLabels(root),
    ...checkHeadingHierarchy(root),
    ...checkFormLabels(root),
    ...checkImageAltText(root),
    ...checkFocusIndicators(root),
  ];

  return allIssues;
}

/**
 * Generate accessibility report
 */
export function generateAccessibilityReport(issues: AccessibilityIssue[]): string {
  const grouped = {
    critical: issues.filter((i) => i.severity === 'critical'),
    serious: issues.filter((i) => i.severity === 'serious'),
    moderate: issues.filter((i) => i.severity === 'moderate'),
    minor: issues.filter((i) => i.severity === 'minor'),
  };

  let report = '## Accessibility Audit Report\n\n';
  report += `Total Issues: ${issues.length}\n\n`;

  Object.entries(grouped).forEach(([severity, items]) => {
    if (items.length > 0) {
      report += `### ${severity.toUpperCase()} (${items.length})\n\n`;
      items.forEach((issue, index) => {
        report += `${index + 1}. **${issue.type}** - ${issue.element}\n`;
        report += `   - ${issue.description}\n`;
        report += `   - WCAG: ${issue.wcagCriterion}\n\n`;
      });
    }
  });

  if (issues.length === 0) {
    report += '✅ No accessibility issues found! Great job!\n';
  }

  return report;
}

/**
 * Log accessibility issues to console
 */
export function logAccessibilityIssues(issues: AccessibilityIssue[]): void {
  if (issues.length === 0) {
    console.log('✅ No accessibility issues found!');
    return;
  }

  console.group('🔍 Accessibility Issues Found');
  console.log(`Total: ${issues.length} issues`);

  const grouped = issues.reduce((acc, issue) => {
    acc[issue.severity] = acc[issue.severity] || [];
    acc[issue.severity].push(issue);
    return acc;
  }, {} as Record<string, AccessibilityIssue[]>);

  Object.entries(grouped).forEach(([severity, items]) => {
    console.group(`${severity.toUpperCase()} (${items.length})`);
    items.forEach((issue) => {
      console.warn(`${issue.element}: ${issue.description}`);
    });
    console.groupEnd();
  });

  console.groupEnd();
}

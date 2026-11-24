import { DetectedFormField } from '../../types/form';

export class FormDetector {
  /**
   * Scans document for form inputs and returns structured field metadata.
   */
  static detectFields(rootElement: HTMLElement | Document = document): DetectedFormField[] {
    const fields: DetectedFormField[] = [];
    const elements = rootElement.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      'input, textarea, select'
    );

    let counter = 0;
    elements.forEach((el) => {
      // Ignore hidden inputs, submit buttons, and extension's own UI
      if (el.closest('#swde-overlay-root') || el.closest('#swde-reading-mode-root')) {
        return;
      }

      const inputType = (el.getAttribute('type') || el.tagName.toLowerCase()).toLowerCase();
      if (['hidden', 'submit', 'button', 'reset', 'image'].includes(inputType)) {
        return;
      }

      counter++;
      const id = el.id || `swde-field-${counter}`;
      if (!el.id) {
        el.setAttribute('data-swde-id', id);
      }

      const name = el.name || '';
      const placeholder = el.getAttribute('placeholder') || '';
      const ariaLabel = el.getAttribute('aria-label') || el.getAttribute('aria-description') || '';
      const autocomplete = el.getAttribute('autocomplete') || '';
      const isRequired = el.hasAttribute('required') || el.getAttribute('aria-required') === 'true';
      const isDisabled = el.disabled || ('readOnly' in el && (el as HTMLInputElement).readOnly);

      // Extract surrounding label text
      const label = this.resolveLabelText(el);

      // Extract nearby context text
      const surroundingText = this.getSurroundingText(el);

      // Extract options if it's a select element
      let options: Array<{ value: string; label: string }> | undefined;
      if (el.tagName.toLowerCase() === 'select') {
        const selectEl = el as HTMLSelectElement;
        options = Array.from(selectEl.options).map((opt) => ({
          value: opt.value,
          label: opt.text.trim(),
        }));
      }

      // Unique CSS selector
      const selector = this.generateSelector(el);

      fields.push({
        id,
        name,
        tagName: el.tagName.toLowerCase() as 'input' | 'textarea' | 'select',
        type: inputType,
        label,
        placeholder,
        ariaLabel,
        autocomplete,
        surroundingText,
        selector,
        currentValue: el.value || '',
        options,
        isRequired,
        isDisabled,
      });
    });

    return fields;
  }

  /**
   * Resolves text from linked <label for="...">, parent <label>, or aria-labelledby
   */
  private static resolveLabelText(el: HTMLElement): string {
    // 1. Check aria-labelledby
    const ariaLabelledBy = el.getAttribute('aria-labelledby');
    if (ariaLabelledBy) {
      const labelEl = document.getElementById(ariaLabelledBy);
      if (labelEl && labelEl.textContent) {
        return labelEl.textContent.trim();
      }
    }

    // 2. Check <label for="id">
    if (el.id) {
      const labelEl = document.querySelector(`label[for="${el.id}"]`);
      if (labelEl && labelEl.textContent) {
        return labelEl.textContent.trim();
      }
    }

    // 3. Check enclosing <label>
    const parentLabel = el.closest('label');
    if (parentLabel && parentLabel.textContent) {
      // Clone and remove inner inputs to get only label text
      const clone = parentLabel.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('input, select, textarea').forEach((n) => n.remove());
      const text = clone.textContent?.trim();
      if (text) return text;
    }

    // 4. Check preceding sibling or parent text
    const prev = el.previousElementSibling;
    if (prev && ['LABEL', 'SPAN', 'P', 'STRONG', 'B'].includes(prev.tagName) && prev.textContent) {
      return prev.textContent.trim();
    }

    return '';
  }

  /**
   * Gets nearby text within same form group/row
   */
  private static getSurroundingText(el: HTMLElement): string {
    const parent = el.closest('.form-group, .field, .row, .col, div, tr');
    if (parent && parent.textContent) {
      return parent.textContent.replace(/\s+/g, ' ').trim().slice(0, 150);
    }
    return '';
  }

  private static generateSelector(el: HTMLElement): string {
    if (el.id) return `#${el.id}`;
    if (el.getAttribute('data-swde-id')) return `[data-swde-id="${el.getAttribute('data-swde-id')}"]`;
    if (el.getAttribute('name')) return `${el.tagName.toLowerCase()}[name="${el.getAttribute('name')}"]`;
    return el.tagName.toLowerCase();
  }
}

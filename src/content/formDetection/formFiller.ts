import { FieldMatchResult } from '../../types/form';

export interface FillOutcome {
  filledCount: number;
  skippedCount: number;
  failedCount: number;
  details: Array<{ fieldLabel: string; value: string; success: boolean }>;
}

export class FormFiller {
  private static previouslyFilledElements: Array<{
    element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    originalValue: string;
    originalOutline: string;
    originalBackground: string;
  }> = [];

  /**
   * Safely fills the approved fields into the webpage DOM and triggers native input/change events.
   */
  static fill(matches: FieldMatchResult[]): FillOutcome {
    const outcome: FillOutcome = {
      filledCount: 0,
      skippedCount: 0,
      failedCount: 0,
      details: [],
    };

    matches.forEach((match) => {
      if (!match.approved) {
        outcome.skippedCount++;
        return;
      }

      try {
        let el = document.querySelector(match.selector) as
          | HTMLInputElement
          | HTMLTextAreaElement
          | HTMLSelectElement
          | null;

        if (!el && match.fieldId) {
          el = document.getElementById(match.fieldId) as any;
          if (!el) {
            el = document.querySelector(`[data-swde-id="${match.fieldId}"]`) as any;
          }
        }

        if (!el) {
          outcome.failedCount++;
          outcome.details.push({
            fieldLabel: match.fieldLabel,
            value: match.suggestedValue,
            success: false,
          });
          return;
        }

        // Save original state for undo
        this.previouslyFilledElements.push({
          element: el,
          originalValue: el.value || '',
          originalOutline: el.style.outline || '',
          originalBackground: el.style.backgroundColor || '',
        });

        // Set value
        if (el.tagName.toLowerCase() === 'select') {
          const select = el as HTMLSelectElement;
          const target = match.suggestedValue.toLowerCase();
          let optionFound = false;

          for (let i = 0; i < select.options.length; i++) {
            const opt = select.options[i];
            if (
              opt.value.toLowerCase() === target ||
              opt.text.toLowerCase() === target ||
              opt.text.toLowerCase().includes(target)
            ) {
              select.selectedIndex = i;
              optionFound = true;
              break;
            }
          }
          if (!optionFound) {
            select.value = match.suggestedValue;
          }
        } else if (
          el.tagName.toLowerCase() === 'input' &&
          ((el as HTMLInputElement).type === 'checkbox' || (el as HTMLInputElement).type === 'radio')
        ) {
          (el as HTMLInputElement).checked = true;
        } else {
          el.value = match.suggestedValue;
        }

        // Dispatch synthetic events so React/Vue/Angular observe the change
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new Event('blur', { bubbles: true }));

        // Subtle visual highlight indicating accessible auto-fill
        el.style.outline = '2px solid #0EA5E9';
        el.style.outlineOffset = '2px';
        el.style.backgroundColor = '#F0F9FF';
        el.setAttribute('data-swde-filled', 'true');

        outcome.filledCount++;
        outcome.details.push({
          fieldLabel: match.fieldLabel,
          value: match.suggestedValue,
          success: true,
        });
      } catch (err) {
        outcome.failedCount++;
        outcome.details.push({
          fieldLabel: match.fieldLabel,
          value: match.suggestedValue,
          success: false,
        });
      }
    });

    return outcome;
  }

  /**
   * Reverts all fields filled during this session back to their original states
   */
  static clearFilled(): number {
    let cleared = 0;
    this.previouslyFilledElements.forEach((record) => {
      try {
        record.element.value = record.originalValue;
        record.element.style.outline = record.originalOutline;
        record.element.style.backgroundColor = record.originalBackground;
        record.element.removeAttribute('data-swde-filled');
        record.element.dispatchEvent(new Event('input', { bubbles: true }));
        record.element.dispatchEvent(new Event('change', { bubbles: true }));
        cleared++;
      } catch (_) {}
    });

    this.previouslyFilledElements = [];
    return cleared;
  }
}

import { FieldMatchResult } from '../../types/form';
import { FormFiller } from './formFiller';

export class FormReviewModal {
  private static modalEl: HTMLElement | null = null;

  static show(
    matches: FieldMatchResult[],
    totalFieldsCount: number,
    onFilled?: () => void
  ): void {
    this.close();

    const root = document.createElement('div');
    root.id = 'swde-form-review-modal';
    root.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 440px;
      max-width: calc(100vw - 40px);
      max-height: calc(100vh - 40px);
      background: #0B132B;
      color: #F8F9FA;
      border: 1px solid #1C2541;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
      z-index: 2147483647;
      display: flex;
      flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-sizing: border-box;
      overflow: hidden;
      animation: swdeSlideIn 0.25s ease-out;
    `;

    const approvedCount = matches.filter((m) => m.approved).length;

    root.innerHTML = `
      <style>
        @keyframes swdeSlideIn {
          from { opacity: 0; transform: translateY(-16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      </style>
      <!-- Header -->
      <div style="padding: 16px 20px; background: #1C2541; border-bottom: 1px solid #2E4170; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="background: #0EA5E9; color: #fff; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px;">⚡</span>
          <div>
            <div style="font-weight: 700; font-size: 15px; color: #FFFFFF;">Smart Form Assistant</div>
            <div style="font-size: 11px; color: #94A3B8;">${matches.length} of ${totalFieldsCount} fields matched from Vault</div>
          </div>
        </div>
        <button id="swde-frm-close-btn" style="background: transparent; border: none; color: #94A3B8; font-size: 20px; cursor: pointer; padding: 4px;">✕</button>
      </div>

      <!-- Security Notice -->
      <div style="padding: 10px 16px; background: rgba(14, 165, 233, 0.1); border-bottom: 1px solid rgba(14, 165, 233, 0.2); font-size: 12px; color: #7DD3FC; display: flex; align-items: center; gap: 6px;">
        <span>🔒</span> Stored locally in your encrypted Vault. Review and approve before filling.
      </div>

      <!-- Fields List -->
      <div id="swde-frm-fields-list" style="padding: 14px 16px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 10px;">
        ${matches
          .map(
            (m, i) => `
          <div style="background: #1C2541; border: 1px solid #2E4170; border-radius: 10px; padding: 12px; display: flex; gap: 10px; align-items: flex-start;">
            <input type="checkbox" id="swde-check-${i}" ${m.approved ? 'checked' : ''} style="margin-top: 3px; accent-color: #0EA5E9; cursor: pointer;" />
            <div style="flex: 1; min-width: 0;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <label for="swde-check-${i}" style="font-size: 13px; font-weight: 600; color: #F1F5F9; cursor: pointer; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
                  ${m.fieldLabel}
                </label>
                <span style="font-size: 11px; font-weight: 600; padding: 2px 6px; border-radius: 4px; background: ${m.confidence >= 0.9 ? '#065F46' : '#1E3A8A'}; color: ${m.confidence >= 0.9 ? '#6EE7B7' : '#93C5FD'};">
                  ${Math.round(m.confidence * 100)}% match
                </span>
              </div>
              <div style="font-size: 13px; color: #38BDF8; font-family: monospace; background: #0B132B; padding: 4px 8px; border-radius: 6px; word-break: break-all;">
                ${m.suggestedValue}
              </div>
              <div style="font-size: 10px; color: #64748B; margin-top: 4px;">
                Vault Key: ${m.vaultLabel} (${m.source})
              </div>
            </div>
          </div>
        `
          )
          .join('')}
      </div>

      <!-- Footer Buttons -->
      <div style="padding: 14px 16px; background: #1C2541; border-top: 1px solid #2E4170; display: flex; gap: 8px; justify-content: space-between; align-items: center;">
        <button id="swde-frm-clear-btn" style="background: transparent; border: 1px solid #475569; color: #CBD5E1; padding: 8px 12px; border-radius: 8px; font-size: 12px; font-weight: 500; cursor: pointer;">
          Clear Fields
        </button>
        <div style="display: flex; gap: 8px;">
          <button id="swde-frm-fill-btn" style="background: #0EA5E9; color: #FFFFFF; border: none; padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;">
            Fill Approved (${approvedCount})
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(root);
    this.modalEl = root;

    // Attach Handlers
    root.querySelector('#swde-frm-close-btn')?.addEventListener('click', () => this.close());

    // Checkbox toggling
    matches.forEach((m, i) => {
      const chk = root.querySelector(`#swde-check-${i}`) as HTMLInputElement | null;
      chk?.addEventListener('change', () => {
        m.approved = chk.checked;
        const fillBtn = root.querySelector('#swde-frm-fill-btn') as HTMLButtonElement | null;
        if (fillBtn) {
          const count = matches.filter((item) => item.approved).length;
          fillBtn.textContent = `Fill Approved (${count})`;
        }
      });
    });

    // Fill button
    root.querySelector('#swde-frm-fill-btn')?.addEventListener('click', () => {
      const outcome = FormFiller.fill(matches);
      this.showCompletionNotice(outcome);
      if (onFilled) onFilled();
    });

    // Clear button
    root.querySelector('#swde-frm-clear-btn')?.addEventListener('click', () => {
      const cleared = FormFiller.clearFilled();
      alert(`Reverted ${cleared} filled form field(s).`);
    });
  }

  private static showCompletionNotice(outcome: any): void {
    if (!this.modalEl) return;
    const list = this.modalEl.querySelector('#swde-frm-fields-list');
    if (list) {
      list.innerHTML = `
        <div style="background: #064E3B; border: 1px solid #059669; border-radius: 10px; padding: 16px; text-align: center;">
          <div style="font-size: 28px; margin-bottom: 6px;">🎉</div>
          <div style="font-size: 16px; font-weight: 700; color: #A7F3D0; margin-bottom: 4px;">
            ${outcome.filledCount} Fields Filled Successfully!
          </div>
          <div style="font-size: 12px; color: #D1FAE5; line-height: 1.5;">
            The fields on the webpage are highlighted in aqua. Please review before submitting.<br/>
            <strong>Note:</strong> We never auto-submit forms.
          </div>
        </div>
      `;
    }
  }

  static close(): void {
    if (this.modalEl) {
      this.modalEl.remove();
      this.modalEl = null;
    }
  }
}

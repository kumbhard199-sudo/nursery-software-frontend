import { useCallback, useMemo, useRef, useState } from 'react';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';

/**
 * Usage:
 * const { confirm, ConfirmDialog } = useConfirmDialog();
 * const ok = await confirm({ title, message, confirmText, variant });
 * return (<>{ConfirmDialog}{...page}</>);
 */
export function useConfirmDialog() {
  const resolverRef = useRef(null);
  const [state, setState] = useState({
    open: false,
    title: 'Confirm',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'danger',
  });

  const confirm = useCallback((opts = {}) => {
    const next = {
      open: true,
      title: opts.title || 'Confirm',
      message: opts.message || '',
      confirmText: opts.confirmText || 'Confirm',
      cancelText: opts.cancelText || 'Cancel',
      variant: opts.variant || 'danger',
    };
    setState(next);

    return new Promise(resolve => {
      resolverRef.current = resolve;
    });
  }, []);

  const close = useCallback(result => {
    setState(s => ({ ...s, open: false }));
    const resolve = resolverRef.current;
    resolverRef.current = null;
    if (resolve) resolve(result);
  }, []);

  const ConfirmDialog = useMemo(() => {
    return (
      <Modal
        open={state.open}
        title={state.title}
        onClose={() => close(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => close(false)}>
              {state.cancelText}
            </Button>
            <Button variant={state.variant} onClick={() => close(true)}>
              {state.confirmText}
            </Button>
          </div>
        }
      >
        <div className="text-sm text-slate-700">{state.message}</div>
      </Modal>
    );
  }, [close, state.cancelText, state.confirmText, state.message, state.open, state.title, state.variant]);

  return { confirm, ConfirmDialog };
}


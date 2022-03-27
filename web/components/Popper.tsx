import { usePopperTooltip } from 'react-popper-tooltip';

export const ClickToCopyPopper = ({text, boldText, popperText}: { text: string; boldText?: boolean; popperText: string; }) => {
  const {
    getArrowProps,
    getTooltipProps,
    setTooltipRef,
    setTriggerRef,
    visible,
  } = usePopperTooltip({
    trigger: 'click',
    interactive: true,
    closeOnTriggerHidden: true,
  });

  const handleClick = () => {
    navigator.clipboard.writeText(popperText);
  }

  return (
    <>
      <div className={`inline-block cursor-pointer ${boldText && 'font-medium'}`} ref={setTriggerRef}>
        {text}
      </div>
      {visible && (
        <div
          ref={setTooltipRef}
          {...getTooltipProps({ className: 'tooltip-container' })}
        >
          <div className='cursor-default text-xs'>--Click to copy--</div>
          <div onClick={handleClick} className='cursor-pointer'>{popperText}</div>
          <div {...getArrowProps({ className: 'tooltip-arrow' })} />
        </div>
      )}
    </>
  );
}

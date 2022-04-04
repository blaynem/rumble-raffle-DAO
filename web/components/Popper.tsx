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
          {...getTooltipProps({ className: 'tooltip-container p-2 shadow-md bg-rumbleBgLight border-2 border-black' })}
        >
          <div className='cursor-default font-light text-xs'>--Click to copy--</div>
          <div onClick={handleClick} className='cursor-pointer font-light'>{popperText}</div>
          <div {...getArrowProps({ className: 'tooltip-arrow' })} />
        </div>
      )}
    </>
  );
}

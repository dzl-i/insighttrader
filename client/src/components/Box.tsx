const Box = ({ title, className, overflow, endContent, children, ...props }: { title?: string; className?: string; overflow?: boolean; children?: React.ReactNode, endContent?: React.ReactNode }) => {
  return (
    <div className={"flex flex-col rounded-lg border border-white/8 dark:border-white/10 bg-white/5 p-4 w-full "+(className || '')} {...props}>
      <div className="flex items-center justify-between gap-4">
        {title && <h2 className="text-lg font-semibold truncate">{title}</h2>}
        {endContent && <div className="flex justify-between items-center">{endContent}</div>}
      </div>
      <div className={"flex-1 "+(overflow ? 'overflow-auto' : 'overflow-hidden')}>
        {children}
      </div>
    </div>
  );
};

export default Box;
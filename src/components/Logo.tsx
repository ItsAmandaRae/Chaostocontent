const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <span
      className={`inline-flex flex-col font-display font-black uppercase leading-[0.8] text-[17px] tracking-normal ${className}`}
      aria-label="Chaos To Content"
    >
      <span>Chaos To</span>
      <span>Content</span>
    </span>
  );
};

export default Logo;

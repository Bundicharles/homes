const VatExcl = ({ className = '' }) => (
  <span
    className={`inline-flex items-center text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded bg-muted/10 text-muted border border-border ${className}`}
    title="Value Added Tax is not included in this price"
  >
    VAT Excl
  </span>
);

export default VatExcl;

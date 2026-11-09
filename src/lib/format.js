const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** 1234 -> "1.2K", 3400000 -> "3.4M". */
export const formatCount = (n) => compact.format(n);

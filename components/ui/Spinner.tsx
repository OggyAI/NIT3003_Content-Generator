// Usage:
// <Spinner />                      (medium, screen readers hear "Loading")
// <Spinner size="lg" label="Generating your draft" />
type SpinnerProps = {
  size?: "sm" | "md" | "lg";
  label?: string;
};

export default function Spinner({ size = "md", label = "Loading" }: SpinnerProps) {
  const sizes = { sm: "h-4 w-4 border-2", md: "h-8 w-8 border-4", lg: "h-12 w-12 border-4" };
  return (
    <span role="status" className="inline-flex">
      <span aria-hidden="true" className={`${sizes[size]} animate-spin rounded-full border-dashed border-teal`} />
      <span className="sr-only">{label}</span>
    </span>
  );
}
// Shared layout for /login, /register, /forgot-password and /reset-password. The (auth) folder
// is a route group, so it doesn't appear in the URL. Styling only: the forms and their logic
// live in login/, register/, forgot-password/ and reset-password/.
// Visual refresh v2 (Harry's arrangement, Karma 14 Nov): from lg, a navy brand panel on the LEFT
// with the tagline as a large headline, three benefits and (xl only) a labelled example output;
// the form on the right. Below lg the form comes first and the panel follows.
// The form is first in the DOM, so keyboard and screen-reader order reach it straight away;
// the panel has nothing interactive in it.
import BrandMark from "@/components/BrandMark";
import { CheckIcon } from "@/components/icons";

const TAGLINE = "Draft marketing content in your business's voice";

const BENEFITS = [
  "Social posts, blog outlines and emails in seconds",
  "Check keywords and tone before you post",
  "Every draft saved in one place",
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-page lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <main className="flex flex-col px-4 py-8 sm:px-8 lg:py-12">
        <div className="lg:hidden">
          <BrandMark />
          <p className="mt-2 text-sm text-muted">{TAGLINE}</p>
        </div>
        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-md rounded-card border border-line bg-white p-6 shadow-card sm:p-10">
            {children}
          </div>
        </div>
      </main>

      <aside
        aria-label="About AI Content Generator"
        className="relative isolate overflow-hidden bg-navy px-4 py-10 text-white sm:px-8 lg:order-first lg:flex lg:min-h-screen lg:flex-col lg:justify-between lg:p-12 xl:p-16"
      >
        {/* Soft glows: the one decorative touch on these pages */}
        <div aria-hidden="true" className="absolute -top-32 -right-32 -z-10 h-96 w-96 rounded-full bg-teal/30 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-40 -left-24 -z-10 h-96 w-96 rounded-full bg-blue-500/30 blur-3xl" />

        <div className="hidden lg:block">
          <BrandMark tone="dark" />
        </div>

        <div className="mx-auto w-full max-w-md lg:mx-0">
          <p className="hidden font-display text-4xl font-bold leading-tight tracking-tight lg:block xl:text-5xl">
            {TAGLINE}.
          </p>
          <ul className="flex flex-col gap-4 lg:mt-8">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-center gap-3 text-blue-100">
                <span
                  aria-hidden="true"
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-300/20 text-teal-300"
                >
                  <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                {b}
              </li>
            ))}
          </ul>

          <figure className="mt-10 hidden rounded-card bg-white/10 p-5 ring-1 ring-white/15 xl:block">
            <figcaption className="text-sm font-semibold text-teal-300">
              Example output · Instagram post for a local café
            </figcaption>
            <blockquote className="mt-3 text-sm leading-6 whitespace-pre-line text-white">
              {`Rainy Monday? We've got you. ☕
Our new chai latte is warm, spiced and ready when you are. Pair it with a slice of banana bread and take five.

#ChaiLatte #LocalCafe #MondayMood`}
            </blockquote>
          </figure>
        </div>

        <p className="mt-8 text-sm text-blue-100 lg:mt-0">Built for small businesses: cafés, shops and local services.</p>
      </aside>
    </div>
  );
}

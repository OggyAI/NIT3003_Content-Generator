// Shared layout for /login, /register, /forgot-password and /reset-password. The (auth) folder
// is a route group, so it doesn't appear in the URL. Styling only: the forms and their logic
// live in login/, register/, forgot-password/ and reset-password/.
// lg and up: the form beside a navy panel with the tagline and a labelled example output.
// Below lg: the form comes first (with the product mark and tagline above it) and the panel
// follows underneath.
import BrandMark from "@/components/BrandMark";

const TAGLINE = "Draft marketing content in your business's voice";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-page lg:grid lg:grid-cols-2">
      <main className="flex flex-col px-4 py-8 sm:px-8 lg:py-12">
        <div>
          <BrandMark />
          <p className="mt-2 text-sm text-muted lg:hidden">{TAGLINE}</p>
        </div>
        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-md rounded-card border border-line bg-white p-6 shadow-card sm:p-8">
            {children}
          </div>
        </div>
      </main>

      <aside
        aria-label="About AI Content Generator"
        className="bg-navy px-4 py-10 text-white sm:px-8 lg:flex lg:flex-col lg:justify-center lg:px-12 xl:px-16"
      >
        <div className="mx-auto w-full max-w-md lg:mx-0">
          <p className="hidden text-3xl font-semibold tracking-tight lg:block">{TAGLINE}</p>
          <p className="text-blue-100 lg:mt-4">
            Tell us about your business once. We&apos;ll draft social posts, blog outlines and emails that
            sound like you, ready for you to edit.
          </p>

          <figure className="mt-8 rounded-card bg-white/10 p-5 ring-1 ring-white/15">
            <figcaption className="text-sm font-semibold text-teal-300">
              Example output · Instagram post for a local café
            </figcaption>
            <blockquote className="mt-3 text-sm leading-6 whitespace-pre-line text-white">
              {`Rainy Monday? We've got you. ☕
Our new chai latte is warm, spiced and ready when you are. Pair it with a slice of banana bread and take five.
Open from 7am, see you soon.

#ChaiLatte #LocalCafe #MondayMood`}
            </blockquote>
          </figure>
          <p className="mt-3 text-sm text-blue-100">Sample text. Your drafts use your own business profile.</p>
        </div>
      </aside>
    </div>
  );
}

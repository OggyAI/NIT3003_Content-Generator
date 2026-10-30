import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Callout from "@/components/ui/Callout";
import Interactive from "./Interactive";

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <Card className="mx-auto flex max-w-xl flex-col gap-8 p-8">
        <section>
          <h2 className="mb-4 text-xl font-bold">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button>Sign In</Button>
            <Button variant="secondary">Duplicate</Button>
            <Button loading>Generating Draft...</Button>
            <Button disabled>Disabled</Button>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold">Inputs</h2>
          <Input label="Business Name" placeholder="Enter your business name" />
          <Input
            label="Topic or Campaign Goal"
            placeholder="Enter your topic or campaign goal"
            hint="e.g. Promote our EOFY sale to local customers"
          />
          <Input label="Email Address" type="email" defaultValue="not-an-email" error="Please enter a valid email address." />
          <Select
            label="Industry"
            placeholder="Select your industry"
            options={["Retail", "Hospitality", "Health & Beauty", "Professional Services", "Other"]}
          />
          <Textarea
            label="Generated Content"
            defaultValue={"EOFY Sale is here!\n\nEnjoy exclusive deals for a limited time.\n\nVisit us in-store or online and save today.\n\n🛍️ #EOFYSale #ShopLocal"}
          />
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold">Analysis</h2>
          <div className="flex flex-wrap gap-2">
            <Badge variant="success">81% SEO</Badge>
            <Badge variant="success">✓ Friendly Tone Match</Badge>
            <Badge variant="warning">Tone mismatch</Badge>
          </div>
          <Callout title="Suggestion">Add urgency such as &quot;Ends this Sunday!&quot;</Callout>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold">Cards</h2>
          <Card className="max-w-sm">
            <p className="font-semibold">EOFY Sale Instagram Post</p>
            <p className="mb-4 text-sm text-muted">Social Media • Saved Today</p>
            <div className="flex gap-3">
              <Button>Open</Button>
              <Button variant="secondary">Duplicate</Button>
            </div>
          </Card>
        </section>
        <Interactive />
      </Card>
    </main>
  );
}
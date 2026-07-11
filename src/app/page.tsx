import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const FEATURES = [
  {
    title: "GTO Solver",
    description:
      "Real-time game-theory optimal solutions for any preflop or postflop scenario.",
    icon: "S",
  },
  {
    title: "Hand Review",
    description:
      "Import hands from any poker site and get AI-powered analysis of every decision.",
    icon: "R",
  },
  {
    title: "Targeted Drills",
    description:
      "Practice specific spots — c-bets, river decisions, 3-bet pots — until they're second nature.",
    icon: "D",
  },
  {
    title: "Leaderboard",
    description:
      "Compete with other players and track your improvement over time.",
    icon: "L",
  },
]

const PRICING = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with basic training.",
    features: ["10 hands/day", "Basic solver", "Community drills", "Public leaderboard"],
    cta: "Start Free",
    href: "/trainer",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "Full power for serious players.",
    features: [
      "Unlimited hands",
      "Full GTO solver",
      "AI hand review",
      "Custom drills",
      "Private leaderboard",
      "Priority support",
    ],
    cta: "Go Pro",
    href: "/trainer",
    highlighted: true,
  },
  {
    name: "Elite",
    price: "$49",
    period: "/month",
    description: "For pros and coaches.",
    features: [
      "Everything in Pro",
      "Advanced solver modes",
      "Team management",
      "API access",
      "White-label option",
      "Dedicated support",
    ],
    cta: "Go Elite",
    href: "/trainer",
    highlighted: false,
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/5 via-background to-success/5 px-6 py-24 text-center lg:py-32">
        <div className="mx-auto max-w-3xl space-y-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Master poker with{" "}
            <span className="bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
              MORF
            </span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            AI-powered GTO solver, hand review, and training drills. Study smarter,
            play better.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/trainer">Start Training</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20">
        <div className="mx-auto max-w-5xl space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">Everything you need to improve</h2>
            <p className="mt-2 text-muted-foreground">
              Tools built by poker players, for poker players.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <Card key={f.title}>
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary">
                    {f.icon}
                  </div>
                  <CardTitle>{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{f.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-border bg-muted/30 px-6 py-20">
        <div className="mx-auto max-w-5xl space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">Simple, transparent pricing</h2>
            <p className="mt-2 text-muted-foreground">
              Start free. Upgrade when you&apos;re ready.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {PRICING.map((p) => (
              <Card
                key={p.name}
                className={p.highlighted ? "border-primary shadow-lg" : ""}
              >
                <CardHeader>
                  <CardTitle>{p.name}</CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{p.price}</span>
                    <span className="text-sm text-muted-foreground">{p.period}</span>
                  </div>
                  <CardDescription>{p.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <span className="text-success">+</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={p.highlighted ? "default" : "outline"}
                    asChild
                  >
                    <Link href={p.href}>{p.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-2xl space-y-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Ready to level up?</h2>
          <p className="text-muted-foreground">
            Join thousands of players improving their game with MORF.
          </p>
          <Button size="lg" asChild>
            <Link href="/trainer">Get Started — It&apos;s Free</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

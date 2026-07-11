import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const FEATURES = [
  {
    title: "Матричная тренировка",
    description:
      "Учи матрицы диапазонов целиком — 13x13网格, визуально и интерактивно.",
    icon: "M",
  },
  {
    title: "Spaced Repetition",
    description:
      "Алгоритм SM-2 (как в Anki) — повторяй в нужный момент, запоминай надолго.",
    icon: "S",
  },
  {
    title: "Poker Room UI",
    description:
      "Стол как в покер-руме: позиции, стеки, блайнды, история действий.",
    icon: "P",
  },
  {
    title: "Импорт из солверов",
    description:
      "Импортируй диапазоны из Flopzilla, PioSolver, Simple Postflop и Anki.",
    icon: "I",
  },
]

const PRICING = [
  {
    name: "Free",
    price: "$0",
    period: "навсегда",
    description: "Начни учить префлоп бесплатно.",
    features: ["2 колоды", "50 карточек", "Базовая статистика", "SM-2 алгоритм"],
    cta: "Начать бесплатно",
    href: "/trainer",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/мес",
    description: "Для серьёзных гриндеров.",
    features: [
      "5 колод",
      "200 карточек",
      "Полная статистика",
      "Импорт диапазонов",
      "Аналитика слабых мест",
    ],
    cta: "Upgrade to Pro",
    href: "/trainer",
    highlighted: true,
  },
  {
    name: "Coach",
    price: "$19",
    period: "/мес",
    description: "Для тренеров и игроков NL100+.",
    features: [
      "Безлимит колод",
      "Безлимит карточек",
      "CRM для учеников",
      "API доступ",
      "Приоритетная поддержка",
    ],
    cta: "Go Coach",
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
            <span className="bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
              MORF
            </span>{" "}
            Poker Trainer
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Визуальный матричный тренажёр префлопа. Учи диапазоны как professional — с интервальным повторением и визуальным столом.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button size="lg" render={<Link href="/trainer" />}>Начать тренировку</Button>
            <Button size="lg" variant="outline" render={<Link href="#features" />}>Узнать больше</Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20">
        <div className="mx-auto max-w-5xl space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">Всё для заучивания префлопа</h2>
            <p className="mt-2 text-muted-foreground">
              Создано покеристами, для покеристов.
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
            <h2 className="text-3xl font-bold tracking-tight">Простое ценообразование</h2>
            <p className="mt-2 text-muted-foreground">
              Начни бесплатно. Обновись когда будешь готов.
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
                    render={<Link href={p.href} />}
                  >
                    {p.cta}
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
          <h2 className="text-3xl font-bold tracking-tight">Готов учить префлоп?</h2>
          <p className="text-muted-foreground">
            Присоединяйся к игрокам, которые улучшают свою игру с MORF.
          </p>
          <Button size="lg" render={<Link href="/trainer" />}>Начать — бесплатно</Button>
        </div>
      </section>
    </div>
  )
}

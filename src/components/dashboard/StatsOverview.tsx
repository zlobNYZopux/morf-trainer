import { Card, CardContent } from '@/components/ui/card';

interface StatsOverviewProps {
  totalReviews: number;
  accuracy: number;
  currentStreak: number;
  cardsMastered: number;
  totalCards: number;
}

export default function StatsOverview({
  totalReviews,
  accuracy,
  currentStreak,
  cardsMastered,
  totalCards,
}: StatsOverviewProps) {
  const stats = [
    {
      label: 'Total Reviews',
      value: totalReviews.toLocaleString(),
      icon: '📊',
    },
    {
      label: 'Accuracy',
      value: `${accuracy}%`,
      icon: '🎯',
    },
    {
      label: 'Current Streak',
      value: `${currentStreak} days`,
      icon: '🔥',
    },
    {
      label: 'Cards Mastered',
      value: `${cardsMastered}/${totalCards}`,
      icon: '✅',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="shadow-sm">
          <CardContent className="flex items-center gap-3 py-4">
            <span className="text-2xl">{stat.icon}</span>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

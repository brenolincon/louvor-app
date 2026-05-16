import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

type Props = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export function WeekPlaceholderCard({ title, description, icon: Icon }: Props) {
  return (
    <Card>
      <div className="mb-4 flex items-center gap-3">
        <Icon className="text-violet-400" size={22} />
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>

      <p className="text-zinc-400">{description}</p>
    </Card>
  );
}

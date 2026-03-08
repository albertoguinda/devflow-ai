import { Card } from "@heroui/react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color?: string;
  className?: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  color,
  className,
}: FeatureCardProps) {
  return (
    <Card
      className={cn(
        "group relative cursor-pointer overflow-hidden surface-card hover-lift card-glow-border",
        className
      )}
    >
      {/* Colored top gradient bar */}
      <div className={cn("h-0.5 accent-glow bg-gradient-to-r transition-all duration-300 group-hover:h-1", color ?? "from-primary to-primary")} />

      <div className="p-6">
        <Card.Header className="flex-row items-start gap-4">
          <div className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
            "bg-gradient-to-br text-white shadow-md ring-1 ring-white/20",
            "group-hover:scale-110 group-hover:shadow-lg",
            color ?? "from-primary to-primary"
          )}>
            <Icon className="size-6" />
          </div>
          <div className="flex flex-col gap-1">
            <Card.Title className="text-lg font-semibold transition-colors group-hover:text-foreground">{title}</Card.Title>
            <Card.Description className="text-sm text-muted-foreground">
              {description}
            </Card.Description>
          </div>
        </Card.Header>
      </div>
    </Card>
  );
}

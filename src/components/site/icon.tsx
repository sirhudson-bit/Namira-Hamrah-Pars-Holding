import {
  Boxes,
  Briefcase,
  Building2,
  Car,
  ChartBar,
  CircleDollarSign,
  Cpu,
  Factory,
  Headset,
  Landmark,
  LayoutGrid,
  Megaphone,
  Package,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Truck,
  Users,
  UtensilsCrossed,
  Wrench,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Boxes,
  Briefcase,
  Building2,
  Car,
  ChartBar,
  CircleDollarSign,
  Cpu,
  Factory,
  Headset,
  Landmark,
  LayoutGrid,
  Megaphone,
  Package,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Truck,
  Users,
  UtensilsCrossed,
  Wrench,
};

/** Resolves a stored icon name to a component, falling back to a neutral mark. */
export function IconByName({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICONS[name] ?? LayoutGrid;
  return <Icon className={className} aria-hidden />;
}

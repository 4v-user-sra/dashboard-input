import React from 'react';
import {
  Car,
  Home,
  Building2,
  Briefcase,
  Truck,
  Wrench,
  CalendarDays,
  Smartphone,
  User,
  Shield,
  Layers,
  HeartPulse,
  Umbrella,
  Laptop,
  Plane,
  FileCheck,
  Award,
  Zap,
  Tag,
  CircleDollarSign,
  LucideIcon,
} from 'lucide-react';

export const iconMap: Record<string, LucideIcon> = {
  Car,
  Home,
  Building2,
  Briefcase,
  Truck,
  Wrench,
  CalendarDays,
  Smartphone,
  User,
  Shield,
  Layers,
  HeartPulse,
  Umbrella,
  Laptop,
  Plane,
  FileCheck,
  Award,
  Zap,
  Tag,
  CircleDollarSign,
};

export function getProductIcon(name: string): LucideIcon {
  return iconMap[name] || Layers;
}

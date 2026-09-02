import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, differenceInDays } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string | Date): string {
  try {
    const d = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(d, 'dd MMM yyyy');
  } catch {
    return String(dateString);
  }
}

export function calculateDays(startDate: string, endDate: string): number {
  try {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const diff = differenceInDays(end, start);
    return diff > 0 ? diff : 1;
  } catch {
    return 1;
  }
}

export function getStatusColor(status: string): { bg: string; text: string; border: string; label: string } {
  switch (status.toUpperCase()) {
    case 'AVAILABLE':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Available Now' };
    case 'IN_USE':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Currently In Use' };
    case 'MAINTENANCE':
      return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', label: 'Under Maintenance' };
    case 'PENDING':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Pending Review' };
    case 'ACCEPTED':
    case 'CONFIRMED':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Confirmed / Accepted' };
    case 'REJECTED':
    case 'CANCELLED':
      return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Rejected' };
    case 'ACTIVE':
    case 'IN_TRANSIT':
      return { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', label: 'Active Rental' };
    case 'COMPLETED':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Completed' };
    default:
      return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', label: status };
  }
}

export function getCategoryFallback(categorySlug: string): string {
  const map: Record<string, string> = {
    'ventilator': '/equipment/ventilator.svg',
    'patient-monitor': '/equipment/patient-monitor.svg',
    'ecg': '/equipment/ecg-machine.svg',
    'ultrasound': '/equipment/ultrasound.svg',
    'infusion-pump': '/equipment/infusion-pump.svg',
    'defibrillator': '/equipment/defibrillator.svg',
    'hospital-bed': '/equipment/hospital-bed.svg',
    'xray': '/equipment/xray-machine.svg',
    'dialysis': '/equipment/dialysis.svg',
    'anesthesia': '/equipment/anesthesia.svg',
  };
  return map[categorySlug] || '/equipment/ventilator.svg';
}

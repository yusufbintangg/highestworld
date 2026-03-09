import React, { useState } from 'react';
import { format, subDays, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Badge } from '../ui/badge';

const QUICK_RANGES = [
  { label: 'Hari Ini', getValue: () => ({ from: startOfDay(new Date()), to: endOfDay(new Date()) }) },
  { label: '7 Hari', getValue: () => ({ from: startOfDay(subDays(new Date(), 6)), to: endOfDay(new Date()) }) },
  { label: '30 Hari', getValue: () => ({ from: startOfDay(subDays(new Date(), 29)), to: endOfDay(new Date()) }) },
  { label: 'Minggu Ini', getValue: () => ({ from: startOfWeek(new Date(), { weekStartsOn: 1 }), to: endOfWeek(new Date(), { weekStartsOn: 1 }) }) },
  { label: 'Bulan Ini', getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
];

export function DateRangePicker({ date, onDateChange, className }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleQuickRange = (range) => {
    onDateChange(range.getValue());
    setIsOpen(false);
  };

  const handleReset = () => {
    onDateChange(null);
    setIsOpen(false);
  };

  const formatDateRange = () => {
    if (!date?.from) return 'Pilih periode';
    if (!date.to) return format(date.from, 'dd MMM yyyy', { locale: id });
    return `${format(date.from, 'dd MMM', { locale: id })} - ${format(date.to, 'dd MMM yyyy', { locale: id })}`;
  };

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange()}
            {date?.from && (
              <Badge variant="secondary" className="ml-2 px-1">
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReset();
                  }}
                />
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            {/* Quick Ranges */}
            <div className="border-r border-border p-3 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Quick Select</p>
              {QUICK_RANGES.map((range) => (
                <Button
                  key={range.label}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-sm"
                  onClick={() => handleQuickRange(range)}
                >
                  {range.label}
                </Button>
              ))}
              <div className="pt-2 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-sm text-red-500 hover:text-red-600"
                  onClick={handleReset}
                >
                  <X className="mr-2 h-3 w-3" />
                  Reset
                </Button>
              </div>
            </div>

            {/* Calendar */}
            <div>
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={onDateChange}
                numberOfMonths={2}
                locale={id}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

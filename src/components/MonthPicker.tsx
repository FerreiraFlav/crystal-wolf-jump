import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface MonthPickerProps {
  selectedYear: number;
  selectedMonth: number; // 0 = Jan, 11 = Dec
  onChangeMonth: (year: number, month: number) => void;
}

export const MonthPicker: React.FC<MonthPickerProps> = ({
  selectedYear,
  selectedMonth,
  onChangeMonth,
}) => {
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const handlePrev = () => {
    if (selectedMonth === 0) {
      onChangeMonth(selectedYear - 1, 11);
    } else {
      onChangeMonth(selectedYear, selectedMonth - 1);
    }
  };

  const handleNext = () => {
    if (selectedMonth === 11) {
      onChangeMonth(selectedYear + 1, 0);
    } else {
      onChangeMonth(selectedYear, selectedMonth + 1);
    }
  };

  const isCurrentMonth = () => {
    const today = new Date();
    return today.getFullYear() === selectedYear && today.getMonth() === selectedMonth;
  };

  const handleResetCurrent = () => {
    const today = new Date();
    onChangeMonth(today.getFullYear(), today.getMonth());
  };

  return (
    <div className="flex items-center space-x-2 bg-white border border-slate-200/90 rounded-2xl p-1.5 shadow-sm">
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePrev}
        className="h-8 w-8 text-slate-600 hover:bg-slate-100 rounded-xl"
        title="Mês Anterior"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      <div className="flex items-center space-x-2 px-2">
        <CalendarIcon className="w-4 h-4 text-emerald-600 shrink-0" />
        <span className="font-bold text-slate-800 text-sm capitalize">
          {monthNames[selectedMonth]} {selectedYear}
        </span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleNext}
        className="h-8 w-8 text-slate-600 hover:bg-slate-100 rounded-xl"
        title="Próximo Mês"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>

      {!isCurrentMonth() && (
        <Button
          variant="secondary"
          size="sm"
          onClick={handleResetCurrent}
          className="text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60 font-semibold px-2.5 h-7 rounded-lg"
        >
          Hoje
        </Button>
      )}
    </div>
  );
};
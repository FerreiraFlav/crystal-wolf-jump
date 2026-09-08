import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useLanguage, Language } from '@/context/LanguageContext';

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
  const { language, t } = useLanguage();

  const localeMap: Record<Language, string> = {
    pt: 'pt-BR',
    en: 'en-US',
    es: 'es-ES'
  };

  const monthName = new Date(selectedYear, selectedMonth, 1).toLocaleDateString(localeMap[language] || 'pt-BR', {
    month: 'long'
  });

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
    <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-1.5 shadow-sm transition-colors">
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePrev}
        className="h-8 w-8 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        title={t('prevMonth')}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      <div className="flex items-center space-x-2 px-2">
        <CalendarIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span className="font-bold text-slate-800 dark:text-slate-100 text-sm capitalize">
          {monthName} {selectedYear}
        </span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleNext}
        className="h-8 w-8 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        title={t('nextMonth')}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>

      {!isCurrentMonth() && (
        <Button
          variant="secondary"
          size="sm"
          onClick={handleResetCurrent}
          className="text-xs bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/60 dark:border-emerald-800/60 font-semibold px-2.5 h-7 rounded-lg transition-colors"
        >
          {t('today')}
        </Button>
      )}
    </div>
  );
};
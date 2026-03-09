// Cron Job Builder: Visual cron expression constructor
// Parses, generates, explains and validates cron expressions

import type {
  CronExpression,
  CronPreset,
  CronExplanation,
  CronFieldExplanation,
  CronField,
  NextExecution,
  CronValidation,
  CronFieldError,
  ConfigFormat,
  CronConfig,
} from "@/types/cron-builder";
import { CRON_FIELD_RANGES } from "@/types/cron-builder";

// --- Locale type (pure, no React) ---

type Locale = string; // "en" | "es" have full translations; others fallback to "en"

// --- i18n Strings Lookup ---

const CRON_STRINGS = {
  en: {
    // Field labels
    fieldLabels: {
      minute: "Minute",
      hour: "Hour",
      dayOfMonth: "Day of month",
      month: "Month",
      dayOfWeek: "Day of week",
    } satisfies Record<CronField, string>,

    // Field units (plural)
    fieldUnits: {
      minute: "minutes",
      hour: "hours",
      dayOfMonth: "days",
      month: "months",
      dayOfWeek: "days",
    } satisfies Record<CronField, string>,

    // Month abbreviations (index 0-11)
    monthNames: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],

    // Day-of-week abbreviations (index 0=Sun .. 6=Sat)
    dayNames: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],

    // Parse / validation messages
    parseError: "Cron expression must have 5 fields",
    invalidExpression: "Invalid expression",
    invalidStep: (label: string, step: string | undefined) => `${label}: invalid step "${step}"`,
    invalidRange: (label: string) => `${label}: invalid range`,
    rangeStartGreaterThanEnd: (label: string) => `${label}: range start is greater than end`,
    invalidRangeInList: (label: string) => `${label}: invalid range in list`,
    notAValidNumber: (label: string, value: string) => `${label}: "${value}" is not a valid number`,
    outOfRange: (label: string, num: number, min: number, max: number) =>
      `${label}: ${num} out of range (${min}-${max})`,

    // Explanation templates
    every: (unit: string) => `Every ${unit}`,
    everyN: (step: string | undefined, unit: string) => `Every ${step} ${unit}`,
    everyNStartingAt: (step: string | undefined, unit: string, base: string | undefined) =>
      `Every ${step} ${unit} starting at ${base}`,
    fromTo: (start: string, end: string) => `From ${start} to ${end}`,

    // buildHumanReadable templates
    everyMinute: "Every minute",
    everyNMinutes: (step: string | undefined) => `Every ${step} minutes`,
    atMinuteOfEveryHour: (minute: string) => `At minute ${minute} of every hour`,
    atTime: (h: string, m: string) => `At ${h}:${m}`,
    atMinuteFromTo: (m: string, start: string | undefined, end: string | undefined) =>
      `At minute ${m}, from ${start}:00 to ${end}:00`,
    minuteFallback: (minute: string) => `minute ${minute}`,
    hourFallback: (hour: string) => `hour ${hour}`,
    onDay: (day: string) => `on day ${day}`,
    days: (dayOfMonth: string) => `days ${dayOfMonth}`,
    inMonth: (monthName: string) => `in ${monthName}`,
    months: (month: string) => `months ${month}`,
    onDayOfWeek: (dayName: string) => `on ${dayName}`,
    mondayToFriday: "Monday to Friday",
    saturdaysAndSundays: "Saturdays and Sundays",
    weekdays: (dayOfWeek: string) => `weekdays ${dayOfWeek}`,

    // formatRelative templates
    inMinutes: (n: number) => `in ${n} minute${n !== 1 ? "s" : ""}`,
    inHoursAndMinutes: (h: number, m: number) => `in ${h}h ${m}m`,
    inHours: (n: number) => `in ${n} hour${n !== 1 ? "s" : ""}`,
    inDays: (n: number) => `in ${n} day${n !== 1 ? "s" : ""}`,
    inWeeks: (n: number) => `in ${n} week${n !== 1 ? "s" : ""}`,

    // Intl locale code for date formatting
    intlLocale: "en-US",

    // Preset names and descriptions
    presets: {
      "every-minute": { name: "Every minute", description: "Runs every minute" },
      "every-5-minutes": { name: "Every 5 minutes", description: "Runs every 5 minutes" },
      "every-15-minutes": { name: "Every 15 minutes", description: "Runs every 15 minutes" },
      "every-30-minutes": { name: "Every 30 minutes", description: "Runs every half hour" },
      "hourly": { name: "Hourly", description: "Runs at the start of every hour" },
      "daily-midnight": { name: "Daily (midnight)", description: "Runs at 00:00 every day" },
      "daily-noon": { name: "Daily (noon)", description: "Runs at 12:00 every day" },
      "weekly-monday": { name: "Weekly (Monday)", description: "Runs every Monday at 00:00" },
      "monthly": { name: "Monthly", description: "Runs on the 1st of every month at 00:00" },
      "weekdays": { name: "Weekdays", description: "Runs Monday to Friday at 09:00" },
      "weekends": { name: "Weekends", description: "Runs Saturdays and Sundays at 10:00" },
      "yearly": { name: "Yearly", description: "Runs on January 1st at 00:00" },
    } as Record<string, { name: string; description: string }>,
  },

  es: {
    // Field labels
    fieldLabels: {
      minute: "Minuto",
      hour: "Hora",
      dayOfMonth: "Día del mes",
      month: "Mes",
      dayOfWeek: "Día de la semana",
    } satisfies Record<CronField, string>,

    // Field units (plural)
    fieldUnits: {
      minute: "minutos",
      hour: "horas",
      dayOfMonth: "días",
      month: "meses",
      dayOfWeek: "días",
    } satisfies Record<CronField, string>,

    // Month abbreviations (index 0-11)
    monthNames: ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"],

    // Day-of-week abbreviations (index 0=Sun .. 6=Sat)
    dayNames: ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"],

    // Parse / validation messages
    parseError: "La expresión cron debe tener 5 campos",
    invalidExpression: "Expresión inválida",
    invalidStep: (label: string, step: string | undefined) => `${label}: paso inválido "${step}"`,
    invalidRange: (label: string) => `${label}: rango inválido`,
    rangeStartGreaterThanEnd: (label: string) => `${label}: el inicio del rango es mayor que el fin`,
    invalidRangeInList: (label: string) => `${label}: rango inválido en lista`,
    notAValidNumber: (label: string, value: string) => `${label}: "${value}" no es un número válido`,
    outOfRange: (label: string, num: number, min: number, max: number) =>
      `${label}: ${num} fuera de rango (${min}-${max})`,

    // Explanation templates
    every: (unit: string) => `Cada ${unit}`,
    everyN: (step: string | undefined, unit: string) => `Cada ${step} ${unit}`,
    everyNStartingAt: (step: string | undefined, unit: string, base: string | undefined) =>
      `Cada ${step} ${unit} empezando en ${base}`,
    fromTo: (start: string, end: string) => `Del ${start} al ${end}`,

    // buildHumanReadable templates
    everyMinute: "Cada minuto",
    everyNMinutes: (step: string | undefined) => `Cada ${step} minutos`,
    atMinuteOfEveryHour: (minute: string) => `En el minuto ${minute} de cada hora`,
    atTime: (h: string, m: string) => `A las ${h}:${m}`,
    atMinuteFromTo: (m: string, start: string | undefined, end: string | undefined) =>
      `En el minuto ${m}, de ${start}:00 a ${end}:00`,
    minuteFallback: (minute: string) => `minuto ${minute}`,
    hourFallback: (hour: string) => `hora ${hour}`,
    onDay: (day: string) => `el día ${day}`,
    days: (dayOfMonth: string) => `días ${dayOfMonth}`,
    inMonth: (monthName: string) => `en ${monthName}`,
    months: (month: string) => `meses ${month}`,
    onDayOfWeek: (dayName: string) => `los ${dayName}`,
    mondayToFriday: "de lunes a viernes",
    saturdaysAndSundays: "sábados y domingos",
    weekdays: (dayOfWeek: string) => `días de semana ${dayOfWeek}`,

    // formatRelative templates
    inMinutes: (n: number) => `en ${n} minuto${n !== 1 ? "s" : ""}`,
    inHoursAndMinutes: (h: number, m: number) => `en ${h}h ${m}m`,
    inHours: (n: number) => `en ${n} hora${n !== 1 ? "s" : ""}`,
    inDays: (n: number) => `en ${n} día${n !== 1 ? "s" : ""}`,
    inWeeks: (n: number) => `en ${n} semana${n !== 1 ? "s" : ""}`,

    // Intl locale code for date formatting
    intlLocale: "es-ES",

    // Preset names and descriptions
    presets: {
      "every-minute": { name: "Cada minuto", description: "Se ejecuta cada minuto" },
      "every-5-minutes": { name: "Cada 5 minutos", description: "Se ejecuta cada 5 minutos" },
      "every-15-minutes": { name: "Cada 15 minutos", description: "Se ejecuta cada 15 minutos" },
      "every-30-minutes": { name: "Cada 30 minutos", description: "Se ejecuta cada media hora" },
      "hourly": { name: "Cada hora", description: "Se ejecuta al inicio de cada hora" },
      "daily-midnight": { name: "Diario (medianoche)", description: "Se ejecuta a las 00:00 cada día" },
      "daily-noon": { name: "Diario (mediodía)", description: "Se ejecuta a las 12:00 cada día" },
      "weekly-monday": { name: "Semanal (lunes)", description: "Se ejecuta cada lunes a las 00:00" },
      "monthly": { name: "Mensual", description: "Se ejecuta el día 1 de cada mes a las 00:00" },
      "weekdays": { name: "Días laborables", description: "Se ejecuta de lunes a viernes a las 09:00" },
      "weekends": { name: "Fines de semana", description: "Se ejecuta sábados y domingos a las 10:00" },
      "yearly": { name: "Anual", description: "Se ejecuta el 1 de enero a las 00:00" },
    } as Record<string, { name: string; description: string }>,
  },

  fr: {
    // Field labels
    fieldLabels: {
      minute: "Minute",
      hour: "Heure",
      dayOfMonth: "Jour du mois",
      month: "Mois",
      dayOfWeek: "Jour de la semaine",
    } satisfies Record<CronField, string>,

    // Field units (plural)
    fieldUnits: {
      minute: "minutes",
      hour: "heures",
      dayOfMonth: "jours",
      month: "mois",
      dayOfWeek: "jours",
    } satisfies Record<CronField, string>,

    // Month abbreviations (index 0-11)
    monthNames: ["JAN", "FÉV", "MAR", "AVR", "MAI", "JUN", "JUL", "AOÛ", "SEP", "OCT", "NOV", "DÉC"],

    // Day-of-week abbreviations (index 0=Sun .. 6=Sat)
    dayNames: ["DIM", "LUN", "MAR", "MER", "JEU", "VEN", "SAM"],

    // Parse / validation messages
    parseError: "L'expression cron doit comporter 5 champs",
    invalidExpression: "Expression invalide",
    invalidStep: (label: string, step: string | undefined) => `${label} : pas invalide "${step}"`,
    invalidRange: (label: string) => `${label} : plage invalide`,
    rangeStartGreaterThanEnd: (label: string) => `${label} : le début de la plage est supérieur à la fin`,
    invalidRangeInList: (label: string) => `${label} : plage invalide dans la liste`,
    notAValidNumber: (label: string, value: string) => `${label} : "${value}" n'est pas un nombre valide`,
    outOfRange: (label: string, num: number, min: number, max: number) =>
      `${label} : ${num} hors limites (${min}-${max})`,

    // Explanation templates
    every: (unit: string) => `Chaque ${unit}`,
    everyN: (step: string | undefined, unit: string) => `Toutes les ${step} ${unit}`,
    everyNStartingAt: (step: string | undefined, unit: string, base: string | undefined) =>
      `Toutes les ${step} ${unit} à partir de ${base}`,
    fromTo: (start: string, end: string) => `De ${start} à ${end}`,

    // buildHumanReadable templates
    everyMinute: "Chaque minute",
    everyNMinutes: (step: string | undefined) => `Toutes les ${step} minutes`,
    atMinuteOfEveryHour: (minute: string) => `À la minute ${minute} de chaque heure`,
    atTime: (h: string, m: string) => `À ${h}:${m}`,
    atMinuteFromTo: (m: string, start: string | undefined, end: string | undefined) =>
      `À la minute ${m}, de ${start}:00 à ${end}:00`,
    minuteFallback: (minute: string) => `minute ${minute}`,
    hourFallback: (hour: string) => `heure ${hour}`,
    onDay: (day: string) => `le jour ${day}`,
    days: (dayOfMonth: string) => `jours ${dayOfMonth}`,
    inMonth: (monthName: string) => `en ${monthName}`,
    months: (month: string) => `mois ${month}`,
    onDayOfWeek: (dayName: string) => `le ${dayName}`,
    mondayToFriday: "du lundi au vendredi",
    saturdaysAndSundays: "samedis et dimanches",
    weekdays: (dayOfWeek: string) => `jours ouvrables ${dayOfWeek}`,

    // formatRelative templates
    inMinutes: (n: number) => `dans ${n} minute${n !== 1 ? "s" : ""}`,
    inHoursAndMinutes: (h: number, m: number) => `dans ${h}h ${m}m`,
    inHours: (n: number) => `dans ${n} heure${n !== 1 ? "s" : ""}`,
    inDays: (n: number) => `dans ${n} jour${n !== 1 ? "s" : ""}`,
    inWeeks: (n: number) => `dans ${n} semaine${n !== 1 ? "s" : ""}`,

    // Intl locale code for date formatting
    intlLocale: "fr-FR",

    // Preset names and descriptions
    presets: {
      "every-minute": { name: "Chaque minute", description: "S'exécute chaque minute" },
      "every-5-minutes": { name: "Toutes les 5 minutes", description: "S'exécute toutes les 5 minutes" },
      "every-15-minutes": { name: "Toutes les 15 minutes", description: "S'exécute toutes les 15 minutes" },
      "every-30-minutes": { name: "Toutes les 30 minutes", description: "S'exécute toutes les demi-heures" },
      "hourly": { name: "Toutes les heures", description: "S'exécute au début de chaque heure" },
      "daily-midnight": { name: "Quotidien (minuit)", description: "S'exécute à 00:00 chaque jour" },
      "daily-noon": { name: "Quotidien (midi)", description: "S'exécute à 12:00 chaque jour" },
      "weekly-monday": { name: "Hebdomadaire (lundi)", description: "S'exécute chaque lundi à 00:00" },
      "monthly": { name: "Mensuel", description: "S'exécute le 1er de chaque mois à 00:00" },
      "weekdays": { name: "Jours ouvrables", description: "S'exécute du lundi au vendredi à 09:00" },
      "weekends": { name: "Week-ends", description: "S'exécute samedis et dimanches à 10:00" },
      "yearly": { name: "Annuel", description: "S'exécute le 1er janvier à 00:00" },
    } as Record<string, { name: string; description: string }>,
  },

  pt: {
    // Field labels
    fieldLabels: {
      minute: "Minuto",
      hour: "Hora",
      dayOfMonth: "Dia do mês",
      month: "Mês",
      dayOfWeek: "Dia da semana",
    } satisfies Record<CronField, string>,

    // Field units (plural)
    fieldUnits: {
      minute: "minutos",
      hour: "horas",
      dayOfMonth: "dias",
      month: "meses",
      dayOfWeek: "dias",
    } satisfies Record<CronField, string>,

    // Month abbreviations (index 0-11)
    monthNames: ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"],

    // Day-of-week abbreviations (index 0=Sun .. 6=Sat)
    dayNames: ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"],

    // Parse / validation messages
    parseError: "A expressão cron deve ter 5 campos",
    invalidExpression: "Expressão inválida",
    invalidStep: (label: string, step: string | undefined) => `${label}: passo inválido "${step}"`,
    invalidRange: (label: string) => `${label}: intervalo inválido`,
    rangeStartGreaterThanEnd: (label: string) => `${label}: o início do intervalo é maior que o fim`,
    invalidRangeInList: (label: string) => `${label}: intervalo inválido na lista`,
    notAValidNumber: (label: string, value: string) => `${label}: "${value}" não é um número válido`,
    outOfRange: (label: string, num: number, min: number, max: number) =>
      `${label}: ${num} fora do intervalo (${min}-${max})`,

    // Explanation templates
    every: (unit: string) => `Cada ${unit}`,
    everyN: (step: string | undefined, unit: string) => `A cada ${step} ${unit}`,
    everyNStartingAt: (step: string | undefined, unit: string, base: string | undefined) =>
      `A cada ${step} ${unit} a partir de ${base}`,
    fromTo: (start: string, end: string) => `De ${start} a ${end}`,

    // buildHumanReadable templates
    everyMinute: "A cada minuto",
    everyNMinutes: (step: string | undefined) => `A cada ${step} minutos`,
    atMinuteOfEveryHour: (minute: string) => `No minuto ${minute} de cada hora`,
    atTime: (h: string, m: string) => `Às ${h}:${m}`,
    atMinuteFromTo: (m: string, start: string | undefined, end: string | undefined) =>
      `No minuto ${m}, de ${start}:00 a ${end}:00`,
    minuteFallback: (minute: string) => `minuto ${minute}`,
    hourFallback: (hour: string) => `hora ${hour}`,
    onDay: (day: string) => `no dia ${day}`,
    days: (dayOfMonth: string) => `dias ${dayOfMonth}`,
    inMonth: (monthName: string) => `em ${monthName}`,
    months: (month: string) => `meses ${month}`,
    onDayOfWeek: (dayName: string) => `na ${dayName}`,
    mondayToFriday: "de segunda a sexta",
    saturdaysAndSundays: "sábados e domingos",
    weekdays: (dayOfWeek: string) => `dias úteis ${dayOfWeek}`,

    // formatRelative templates
    inMinutes: (n: number) => `em ${n} minuto${n !== 1 ? "s" : ""}`,
    inHoursAndMinutes: (h: number, m: number) => `em ${h}h ${m}m`,
    inHours: (n: number) => `em ${n} hora${n !== 1 ? "s" : ""}`,
    inDays: (n: number) => `em ${n} dia${n !== 1 ? "s" : ""}`,
    inWeeks: (n: number) => `em ${n} semana${n !== 1 ? "s" : ""}`,

    // Intl locale code for date formatting
    intlLocale: "pt-BR",

    // Preset names and descriptions
    presets: {
      "every-minute": { name: "A cada minuto", description: "Executa a cada minuto" },
      "every-5-minutes": { name: "A cada 5 minutos", description: "Executa a cada 5 minutos" },
      "every-15-minutes": { name: "A cada 15 minutos", description: "Executa a cada 15 minutos" },
      "every-30-minutes": { name: "A cada 30 minutos", description: "Executa a cada meia hora" },
      "hourly": { name: "A cada hora", description: "Executa no início de cada hora" },
      "daily-midnight": { name: "Diário (meia-noite)", description: "Executa às 00:00 todos os dias" },
      "daily-noon": { name: "Diário (meio-dia)", description: "Executa às 12:00 todos os dias" },
      "weekly-monday": { name: "Semanal (segunda)", description: "Executa toda segunda-feira às 00:00" },
      "monthly": { name: "Mensal", description: "Executa no dia 1 de cada mês às 00:00" },
      "weekdays": { name: "Dias úteis", description: "Executa de segunda a sexta às 09:00" },
      "weekends": { name: "Fins de semana", description: "Executa sábados e domingos às 10:00" },
      "yearly": { name: "Anual", description: "Executa em 1 de janeiro às 00:00" },
    } as Record<string, { name: string; description: string }>,
  },

  de: {
    // Field labels
    fieldLabels: {
      minute: "Minute",
      hour: "Stunde",
      dayOfMonth: "Tag des Monats",
      month: "Monat",
      dayOfWeek: "Wochentag",
    } satisfies Record<CronField, string>,

    // Field units (plural)
    fieldUnits: {
      minute: "Minuten",
      hour: "Stunden",
      dayOfMonth: "Tage",
      month: "Monate",
      dayOfWeek: "Tage",
    } satisfies Record<CronField, string>,

    // Month abbreviations (index 0-11)
    monthNames: ["JAN", "FEB", "MÄR", "APR", "MAI", "JUN", "JUL", "AUG", "SEP", "OKT", "NOV", "DEZ"],

    // Day-of-week abbreviations (index 0=Sun .. 6=Sat)
    dayNames: ["SO", "MO", "DI", "MI", "DO", "FR", "SA"],

    // Parse / validation messages
    parseError: "Der Cron-Ausdruck muss 5 Felder haben",
    invalidExpression: "Ungültiger Ausdruck",
    invalidStep: (label: string, step: string | undefined) => `${label}: ungültiger Schritt "${step}"`,
    invalidRange: (label: string) => `${label}: ungültiger Bereich`,
    rangeStartGreaterThanEnd: (label: string) => `${label}: Bereichsanfang ist größer als das Ende`,
    invalidRangeInList: (label: string) => `${label}: ungültiger Bereich in der Liste`,
    notAValidNumber: (label: string, value: string) => `${label}: "${value}" ist keine gültige Zahl`,
    outOfRange: (label: string, num: number, min: number, max: number) =>
      `${label}: ${num} außerhalb des Bereichs (${min}-${max})`,

    // Explanation templates
    every: (unit: string) => `Jede ${unit}`,
    everyN: (step: string | undefined, unit: string) => `Alle ${step} ${unit}`,
    everyNStartingAt: (step: string | undefined, unit: string, base: string | undefined) =>
      `Alle ${step} ${unit} ab ${base}`,
    fromTo: (start: string, end: string) => `Von ${start} bis ${end}`,

    // buildHumanReadable templates
    everyMinute: "Jede Minute",
    everyNMinutes: (step: string | undefined) => `Alle ${step} Minuten`,
    atMinuteOfEveryHour: (minute: string) => `In Minute ${minute} jeder Stunde`,
    atTime: (h: string, m: string) => `Um ${h}:${m}`,
    atMinuteFromTo: (m: string, start: string | undefined, end: string | undefined) =>
      `In Minute ${m}, von ${start}:00 bis ${end}:00`,
    minuteFallback: (minute: string) => `Minute ${minute}`,
    hourFallback: (hour: string) => `Stunde ${hour}`,
    onDay: (day: string) => `am Tag ${day}`,
    days: (dayOfMonth: string) => `Tage ${dayOfMonth}`,
    inMonth: (monthName: string) => `im ${monthName}`,
    months: (month: string) => `Monate ${month}`,
    onDayOfWeek: (dayName: string) => `am ${dayName}`,
    mondayToFriday: "Montag bis Freitag",
    saturdaysAndSundays: "Samstage und Sonntage",
    weekdays: (dayOfWeek: string) => `Wochentage ${dayOfWeek}`,

    // formatRelative templates
    inMinutes: (n: number) => `in ${n} Minute${n !== 1 ? "n" : ""}`,
    inHoursAndMinutes: (h: number, m: number) => `in ${h}h ${m}m`,
    inHours: (n: number) => `in ${n} Stunde${n !== 1 ? "n" : ""}`,
    inDays: (n: number) => `in ${n} Tag${n !== 1 ? "en" : ""}`,
    inWeeks: (n: number) => `in ${n} Woche${n !== 1 ? "n" : ""}`,

    // Intl locale code for date formatting
    intlLocale: "de-DE",

    // Preset names and descriptions
    presets: {
      "every-minute": { name: "Jede Minute", description: "Wird jede Minute ausgeführt" },
      "every-5-minutes": { name: "Alle 5 Minuten", description: "Wird alle 5 Minuten ausgeführt" },
      "every-15-minutes": { name: "Alle 15 Minuten", description: "Wird alle 15 Minuten ausgeführt" },
      "every-30-minutes": { name: "Alle 30 Minuten", description: "Wird alle halbe Stunde ausgeführt" },
      "hourly": { name: "Stündlich", description: "Wird zu Beginn jeder Stunde ausgeführt" },
      "daily-midnight": { name: "Täglich (Mitternacht)", description: "Wird täglich um 00:00 ausgeführt" },
      "daily-noon": { name: "Täglich (Mittag)", description: "Wird täglich um 12:00 ausgeführt" },
      "weekly-monday": { name: "Wöchentlich (Montag)", description: "Wird jeden Montag um 00:00 ausgeführt" },
      "monthly": { name: "Monatlich", description: "Wird am 1. jedes Monats um 00:00 ausgeführt" },
      "weekdays": { name: "Werktage", description: "Wird Montag bis Freitag um 09:00 ausgeführt" },
      "weekends": { name: "Wochenende", description: "Wird Samstag und Sonntag um 10:00 ausgeführt" },
      "yearly": { name: "Jährlich", description: "Wird am 1. Januar um 00:00 ausgeführt" },
    } as Record<string, { name: string; description: string }>,
  },

  it: {
    // Field labels
    fieldLabels: {
      minute: "Minuto",
      hour: "Ora",
      dayOfMonth: "Giorno del mese",
      month: "Mese",
      dayOfWeek: "Giorno della settimana",
    } satisfies Record<CronField, string>,

    // Field units (plural)
    fieldUnits: {
      minute: "minuti",
      hour: "ore",
      dayOfMonth: "giorni",
      month: "mesi",
      dayOfWeek: "giorni",
    } satisfies Record<CronField, string>,

    // Month abbreviations (index 0-11)
    monthNames: ["GEN", "FEB", "MAR", "APR", "MAG", "GIU", "LUG", "AGO", "SET", "OTT", "NOV", "DIC"],

    // Day-of-week abbreviations (index 0=Sun .. 6=Sat)
    dayNames: ["DOM", "LUN", "MAR", "MER", "GIO", "VEN", "SAB"],

    // Parse / validation messages
    parseError: "L'espressione cron deve avere 5 campi",
    invalidExpression: "Espressione non valida",
    invalidStep: (label: string, step: string | undefined) => `${label}: passo non valido "${step}"`,
    invalidRange: (label: string) => `${label}: intervallo non valido`,
    rangeStartGreaterThanEnd: (label: string) => `${label}: l'inizio dell'intervallo è maggiore della fine`,
    invalidRangeInList: (label: string) => `${label}: intervallo non valido nella lista`,
    notAValidNumber: (label: string, value: string) => `${label}: "${value}" non è un numero valido`,
    outOfRange: (label: string, num: number, min: number, max: number) =>
      `${label}: ${num} fuori dall'intervallo (${min}-${max})`,

    // Explanation templates
    every: (unit: string) => `Ogni ${unit}`,
    everyN: (step: string | undefined, unit: string) => `Ogni ${step} ${unit}`,
    everyNStartingAt: (step: string | undefined, unit: string, base: string | undefined) =>
      `Ogni ${step} ${unit} a partire da ${base}`,
    fromTo: (start: string, end: string) => `Da ${start} a ${end}`,

    // buildHumanReadable templates
    everyMinute: "Ogni minuto",
    everyNMinutes: (step: string | undefined) => `Ogni ${step} minuti`,
    atMinuteOfEveryHour: (minute: string) => `Al minuto ${minute} di ogni ora`,
    atTime: (h: string, m: string) => `Alle ${h}:${m}`,
    atMinuteFromTo: (m: string, start: string | undefined, end: string | undefined) =>
      `Al minuto ${m}, dalle ${start}:00 alle ${end}:00`,
    minuteFallback: (minute: string) => `minuto ${minute}`,
    hourFallback: (hour: string) => `ora ${hour}`,
    onDay: (day: string) => `il giorno ${day}`,
    days: (dayOfMonth: string) => `giorni ${dayOfMonth}`,
    inMonth: (monthName: string) => `a ${monthName}`,
    months: (month: string) => `mesi ${month}`,
    onDayOfWeek: (dayName: string) => `il ${dayName}`,
    mondayToFriday: "da lunedì a venerdì",
    saturdaysAndSundays: "sabato e domenica",
    weekdays: (dayOfWeek: string) => `giorni feriali ${dayOfWeek}`,

    // formatRelative templates
    inMinutes: (n: number) => `tra ${n} minut${n !== 1 ? "i" : "o"}`,
    inHoursAndMinutes: (h: number, m: number) => `tra ${h}h ${m}m`,
    inHours: (n: number) => `tra ${n} or${n !== 1 ? "e" : "a"}`,
    inDays: (n: number) => `tra ${n} giorn${n !== 1 ? "i" : "o"}`,
    inWeeks: (n: number) => `tra ${n} settiman${n !== 1 ? "e" : "a"}`,

    // Intl locale code for date formatting
    intlLocale: "it-IT",

    // Preset names and descriptions
    presets: {
      "every-minute": { name: "Ogni minuto", description: "Eseguito ogni minuto" },
      "every-5-minutes": { name: "Ogni 5 minuti", description: "Eseguito ogni 5 minuti" },
      "every-15-minutes": { name: "Ogni 15 minuti", description: "Eseguito ogni 15 minuti" },
      "every-30-minutes": { name: "Ogni 30 minuti", description: "Eseguito ogni mezz'ora" },
      "hourly": { name: "Ogni ora", description: "Eseguito all'inizio di ogni ora" },
      "daily-midnight": { name: "Giornaliero (mezzanotte)", description: "Eseguito alle 00:00 ogni giorno" },
      "daily-noon": { name: "Giornaliero (mezzogiorno)", description: "Eseguito alle 12:00 ogni giorno" },
      "weekly-monday": { name: "Settimanale (lunedì)", description: "Eseguito ogni lunedì alle 00:00" },
      "monthly": { name: "Mensile", description: "Eseguito il 1° di ogni mese alle 00:00" },
      "weekdays": { name: "Giorni feriali", description: "Eseguito da lunedì a venerdì alle 09:00" },
      "weekends": { name: "Fine settimana", description: "Eseguito sabato e domenica alle 10:00" },
      "yearly": { name: "Annuale", description: "Eseguito il 1° gennaio alle 00:00" },
    } as Record<string, { name: string; description: string }>,
  },

  zh: {
    // Field labels
    fieldLabels: {
      minute: "分钟",
      hour: "小时",
      dayOfMonth: "日",
      month: "月",
      dayOfWeek: "星期",
    } satisfies Record<CronField, string>,

    // Field units (plural)
    fieldUnits: {
      minute: "分钟",
      hour: "小时",
      dayOfMonth: "天",
      month: "个月",
      dayOfWeek: "天",
    } satisfies Record<CronField, string>,

    // Month abbreviations (index 0-11)
    monthNames: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],

    // Day-of-week abbreviations (index 0=Sun .. 6=Sat)
    dayNames: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],

    // Parse / validation messages
    parseError: "Cron表达式必须包含5个字段",
    invalidExpression: "无效的表达式",
    invalidStep: (label: string, step: string | undefined) => `${label}：步长 "${step}" 无效`,
    invalidRange: (label: string) => `${label}：范围无效`,
    rangeStartGreaterThanEnd: (label: string) => `${label}：范围起始值大于结束值`,
    invalidRangeInList: (label: string) => `${label}：列表中的范围无效`,
    notAValidNumber: (label: string, value: string) => `${label}："${value}" 不是有效数字`,
    outOfRange: (label: string, num: number, min: number, max: number) =>
      `${label}：${num} 超出范围 (${min}-${max})`,

    // Explanation templates
    every: (unit: string) => `每${unit}`,
    everyN: (step: string | undefined, unit: string) => `每 ${step} ${unit}`,
    everyNStartingAt: (step: string | undefined, unit: string, base: string | undefined) =>
      `从 ${base} 开始每 ${step} ${unit}`,
    fromTo: (start: string, end: string) => `从 ${start} 到 ${end}`,

    // buildHumanReadable templates
    everyMinute: "每分钟",
    everyNMinutes: (step: string | undefined) => `每 ${step} 分钟`,
    atMinuteOfEveryHour: (minute: string) => `每小时的第 ${minute} 分钟`,
    atTime: (h: string, m: string) => `在 ${h}:${m}`,
    atMinuteFromTo: (m: string, start: string | undefined, end: string | undefined) =>
      `在第 ${m} 分钟，从 ${start}:00 到 ${end}:00`,
    minuteFallback: (minute: string) => `第 ${minute} 分钟`,
    hourFallback: (hour: string) => `第 ${hour} 小时`,
    onDay: (day: string) => `每月第 ${day} 天`,
    days: (dayOfMonth: string) => `第 ${dayOfMonth} 天`,
    inMonth: (monthName: string) => `在 ${monthName}`,
    months: (month: string) => `第 ${month} 月`,
    onDayOfWeek: (dayName: string) => `在${dayName}`,
    mondayToFriday: "周一至周五",
    saturdaysAndSundays: "周六和周日",
    weekdays: (dayOfWeek: string) => `工作日 ${dayOfWeek}`,

    // formatRelative templates
    inMinutes: (n: number) => `${n} 分钟后`,
    inHoursAndMinutes: (h: number, m: number) => `${h}小时 ${m}分钟后`,
    inHours: (n: number) => `${n} 小时后`,
    inDays: (n: number) => `${n} 天后`,
    inWeeks: (n: number) => `${n} 周后`,

    // Intl locale code for date formatting
    intlLocale: "zh-CN",

    // Preset names and descriptions
    presets: {
      "every-minute": { name: "每分钟", description: "每分钟执行一次" },
      "every-5-minutes": { name: "每5分钟", description: "每5分钟执行一次" },
      "every-15-minutes": { name: "每15分钟", description: "每15分钟执行一次" },
      "every-30-minutes": { name: "每30分钟", description: "每半小时执行一次" },
      "hourly": { name: "每小时", description: "每小时开始时执行" },
      "daily-midnight": { name: "每日（午夜）", description: "每天 00:00 执行" },
      "daily-noon": { name: "每日（中午）", description: "每天 12:00 执行" },
      "weekly-monday": { name: "每周（周一）", description: "每周一 00:00 执行" },
      "monthly": { name: "每月", description: "每月1日 00:00 执行" },
      "weekdays": { name: "工作日", description: "周一至周五 09:00 执行" },
      "weekends": { name: "周末", description: "周六和周日 10:00 执行" },
      "yearly": { name: "每年", description: "每年1月1日 00:00 执行" },
    } as Record<string, { name: string; description: string }>,
  },

  ja: {
    // Field labels
    fieldLabels: {
      minute: "分",
      hour: "時",
      dayOfMonth: "日",
      month: "月",
      dayOfWeek: "曜日",
    } satisfies Record<CronField, string>,

    // Field units (plural)
    fieldUnits: {
      minute: "分",
      hour: "時間",
      dayOfMonth: "日",
      month: "ヶ月",
      dayOfWeek: "日",
    } satisfies Record<CronField, string>,

    // Month abbreviations (index 0-11)
    monthNames: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],

    // Day-of-week abbreviations (index 0=Sun .. 6=Sat)
    dayNames: ["日", "月", "火", "水", "木", "金", "土"],

    // Parse / validation messages
    parseError: "Cron式は5つのフィールドが必要です",
    invalidExpression: "無効な式",
    invalidStep: (label: string, step: string | undefined) => `${label}：ステップ "${step}" は無効です`,
    invalidRange: (label: string) => `${label}：範囲が無効です`,
    rangeStartGreaterThanEnd: (label: string) => `${label}：範囲の開始が終了より大きいです`,
    invalidRangeInList: (label: string) => `${label}：リスト内の範囲が無効です`,
    notAValidNumber: (label: string, value: string) => `${label}："${value}" は有効な数値ではありません`,
    outOfRange: (label: string, num: number, min: number, max: number) =>
      `${label}：${num} は範囲外です (${min}-${max})`,

    // Explanation templates
    every: (unit: string) => `毎${unit}`,
    everyN: (step: string | undefined, unit: string) => `${step}${unit}ごと`,
    everyNStartingAt: (step: string | undefined, unit: string, base: string | undefined) =>
      `${base}から${step}${unit}ごと`,
    fromTo: (start: string, end: string) => `${start}から${end}まで`,

    // buildHumanReadable templates
    everyMinute: "毎分",
    everyNMinutes: (step: string | undefined) => `${step}分ごと`,
    atMinuteOfEveryHour: (minute: string) => `毎時${minute}分`,
    atTime: (h: string, m: string) => `${h}:${m}に`,
    atMinuteFromTo: (m: string, start: string | undefined, end: string | undefined) =>
      `${m}分に、${start}:00から${end}:00まで`,
    minuteFallback: (minute: string) => `${minute}分`,
    hourFallback: (hour: string) => `${hour}時`,
    onDay: (day: string) => `${day}日に`,
    days: (dayOfMonth: string) => `${dayOfMonth}日`,
    inMonth: (monthName: string) => `${monthName}に`,
    months: (month: string) => `${month}月`,
    onDayOfWeek: (dayName: string) => `${dayName}曜日に`,
    mondayToFriday: "月曜日から金曜日",
    saturdaysAndSundays: "土曜日と日曜日",
    weekdays: (dayOfWeek: string) => `平日 ${dayOfWeek}`,

    // formatRelative templates
    inMinutes: (n: number) => `${n}分後`,
    inHoursAndMinutes: (h: number, m: number) => `${h}時間${m}分後`,
    inHours: (n: number) => `${n}時間後`,
    inDays: (n: number) => `${n}日後`,
    inWeeks: (n: number) => `${n}週間後`,

    // Intl locale code for date formatting
    intlLocale: "ja-JP",

    // Preset names and descriptions
    presets: {
      "every-minute": { name: "毎分", description: "毎分実行" },
      "every-5-minutes": { name: "5分ごと", description: "5分ごとに実行" },
      "every-15-minutes": { name: "15分ごと", description: "15分ごとに実行" },
      "every-30-minutes": { name: "30分ごと", description: "30分ごとに実行" },
      "hourly": { name: "毎時", description: "毎時0分に実行" },
      "daily-midnight": { name: "毎日（深夜）", description: "毎日 00:00 に実行" },
      "daily-noon": { name: "毎日（正午）", description: "毎日 12:00 に実行" },
      "weekly-monday": { name: "毎週（月曜）", description: "毎週月曜日 00:00 に実行" },
      "monthly": { name: "毎月", description: "毎月1日 00:00 に実行" },
      "weekdays": { name: "平日", description: "月曜〜金曜 09:00 に実行" },
      "weekends": { name: "週末", description: "土曜・日曜 10:00 に実行" },
      "yearly": { name: "毎年", description: "毎年1月1日 00:00 に実行" },
    } as Record<string, { name: string; description: string }>,
  },
} as const;

/** Helper to get the locale-aware strings object */
function t(locale: Locale) {
  return (CRON_STRINGS[locale as keyof typeof CRON_STRINGS] ?? CRON_STRINGS.en);
}

// --- IaC Generators ---

export function generateConfig(expression: string, format: ConfigFormat): CronConfig {
  switch (format) {
    case "kubernetes":
      return {
        format,
        label: "Kubernetes CronJob",
        language: "yaml",
        code: `apiVersion: batch/v1
kind: CronJob
metadata:
  name: my-cron-job
spec:
  schedule: "${expression}"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: job
            image: my-image:latest
          restartPolicy: OnFailure`,
      };
    case "github-actions":
      return {
        format,
        label: "GitHub Actions",
        language: "yaml",
        code: `name: Scheduled Job
on:
  schedule:
    - cron: '${expression}'
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run script
        run: echo "Running scheduled task"`,
      };
    case "aws-eventbridge":
      return {
        format,
        label: "AWS EventBridge",
        language: "json",
        // Note: AWS uses ? for wildcards sometimes
        code: `{
  "Name": "my-scheduled-rule",
  "ScheduleExpression": "cron(${expression.replace(/\*/g, "?")})",
  "State": "ENABLED"
}`,
      };
    case "linux-crontab":
    default:
      return {
        format,
        label: "Linux Crontab",
        language: "bash",
        code: `${expression} /usr/bin/python3 /path/to/script.py >> /var/log/cron.log 2>&1`,
      };
  }
}

// --- Common Presets (base data, locale-independent) ---

const CRON_PRESETS_BASE: Omit<CronPreset, "name" | "description">[] = [
  { id: "every-minute", expression: "* * * * *", icon: "Zap" },
  { id: "every-5-minutes", expression: "*/5 * * * *", icon: "Clock" },
  { id: "every-15-minutes", expression: "*/15 * * * *", icon: "Clock" },
  { id: "every-30-minutes", expression: "*/30 * * * *", icon: "Clock" },
  { id: "hourly", expression: "0 * * * *", icon: "Clock" },
  { id: "daily-midnight", expression: "0 0 * * *", icon: "Calendar" },
  { id: "daily-noon", expression: "0 12 * * *", icon: "Sun" },
  { id: "weekly-monday", expression: "0 0 * * 1", icon: "Calendar" },
  { id: "monthly", expression: "0 0 1 * *", icon: "Calendar" },
  { id: "weekdays", expression: "0 9 * * 1-5", icon: "Briefcase" },
  { id: "weekends", expression: "0 10 * * 0,6", icon: "Coffee" },
  { id: "yearly", expression: "0 0 1 1 *", icon: "Gift" },
];

/** Get locale-aware presets. Defaults to English. */
export function getCronPresets(locale: Locale = "en"): CronPreset[] {
  const strings = t(locale);
  return CRON_PRESETS_BASE.map((base) => {
    const presetStrings = strings.presets[base.id];
    return {
      ...base,
      name: presetStrings?.name ?? base.id,
      description: presetStrings?.description ?? "",
    };
  });
}

/**
 * Legacy static export for backward-compatibility.
 * New callers should prefer `getCronPresets(locale)`.
 */
export const CRON_PRESETS: CronPreset[] = getCronPresets("en");

// --- Parse Expression ---

export function parseExpression(expression: string, locale: Locale = "en"): CronExpression {
  const parts = expression.trim().split(/\s+/);

  if (parts.length !== 5) {
    throw new Error(t(locale).parseError);
  }

  return {
    minute: parts[0] ?? "*",
    hour: parts[1] ?? "*",
    dayOfMonth: parts[2] ?? "*",
    month: parts[3] ?? "*",
    dayOfWeek: parts[4] ?? "*",
  };
}

export function buildExpression(cron: CronExpression): string {
  return `${cron.minute} ${cron.hour} ${cron.dayOfMonth} ${cron.month} ${cron.dayOfWeek}`;
}

// --- Validation ---

export function validateExpression(expression: string, locale: Locale = "en"): CronValidation {
  const errors: CronFieldError[] = [];

  try {
    const cron = parseExpression(expression, locale);
    const fields: CronField[] = ["minute", "hour", "dayOfMonth", "month", "dayOfWeek"];

    for (const field of fields) {
      const value = cron[field];
      const fieldError = validateField(field, value, locale);
      if (fieldError) {
        errors.push(fieldError);
      }
    }
  } catch (e) {
    errors.push({
      field: "minute",
      message: e instanceof Error ? e.message : t(locale).invalidExpression,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function validateField(field: CronField, value: string, locale: Locale): CronFieldError | null {
  const range = CRON_FIELD_RANGES[field];
  const strings = t(locale);
  const label = strings.fieldLabels[field];

  // Wildcard
  if (value === "*") return null;

  // Step values: */n or n/m
  if (value.includes("/")) {
    const [base, step] = value.split("/");
    if (base !== "*" && base !== undefined) {
      const baseError = validateFieldValue(field, base, range, locale);
      if (baseError) return baseError;
    }
    if (step === undefined || !/^\d+$/.test(step) || parseInt(step) < 1) {
      return { field, message: strings.invalidStep(label, step) };
    }
    return null;
  }

  // Range: n-m
  if (value.includes("-") && !value.includes(",")) {
    const [start, end] = value.split("-");
    if (start === undefined || end === undefined) {
      return { field, message: strings.invalidRange(label) };
    }
    const startError = validateFieldValue(field, start, range, locale);
    if (startError) return startError;
    const endError = validateFieldValue(field, end, range, locale);
    if (endError) return endError;

    if (parseInt(start) > parseInt(end)) {
      return { field, message: strings.rangeStartGreaterThanEnd(label) };
    }
    return null;
  }

  // List: n,m,o
  if (value.includes(",")) {
    const items = value.split(",");
    for (const item of items) {
      // Each item can be a number or a range
      if (item.includes("-")) {
        const [start, end] = item.split("-");
        if (start === undefined || end === undefined) {
          return { field, message: strings.invalidRangeInList(label) };
        }
        const startError = validateFieldValue(field, start, range, locale);
        if (startError) return startError;
        const endError = validateFieldValue(field, end, range, locale);
        if (endError) return endError;
      } else {
        const itemError = validateFieldValue(field, item, range, locale);
        if (itemError) return itemError;
      }
    }
    return null;
  }

  // Single value
  return validateFieldValue(field, value, range, locale);
}

function validateFieldValue(
  field: CronField,
  value: string,
  range: { min: number; max: number },
  locale: Locale
): CronFieldError | null {
  const num = parseInt(value);
  const strings = t(locale);
  const label = strings.fieldLabels[field];

  if (isNaN(num)) {
    return { field, message: strings.notAValidNumber(label, value) };
  }

  if (num < range.min || num > range.max) {
    return {
      field,
      message: strings.outOfRange(label, num, range.min, range.max),
    };
  }

  return null;
}

// --- Explanation ---

export function explainExpression(expression: string, locale: Locale = "en"): CronExplanation {
  const validation = validateExpression(expression, locale);
  if (!validation.isValid) {
    return {
      summary: t(locale).invalidExpression,
      details: [],
      humanReadable: validation.errors.map((e) => e.message).join(". "),
    };
  }

  const cron = parseExpression(expression, locale);
  const details: CronFieldExplanation[] = [
    { field: "minute", value: cron.minute, explanation: explainField("minute", cron.minute, locale) },
    { field: "hour", value: cron.hour, explanation: explainField("hour", cron.hour, locale) },
    { field: "dayOfMonth", value: cron.dayOfMonth, explanation: explainField("dayOfMonth", cron.dayOfMonth, locale) },
    { field: "month", value: cron.month, explanation: explainField("month", cron.month, locale) },
    { field: "dayOfWeek", value: cron.dayOfWeek, explanation: explainField("dayOfWeek", cron.dayOfWeek, locale) },
  ];

  const humanReadable = buildHumanReadable(cron, locale);

  return {
    summary: humanReadable,
    details,
    humanReadable,
  };
}

function explainField(field: CronField, value: string, locale: Locale): string {
  const strings = t(locale);
  const label = strings.fieldLabels[field];
  const range = CRON_FIELD_RANGES[field];

  if (value === "*") {
    return strings.every(label.toLowerCase());
  }

  if (value.includes("/")) {
    const [base, step] = value.split("/");
    const unit = strings.fieldUnits[field];
    if (base === "*") {
      return strings.everyN(step, unit);
    }
    return strings.everyNStartingAt(step, unit, base);
  }

  if (value.includes("-") && !value.includes(",")) {
    const [start, end] = value.split("-");
    return strings.fromTo(
      formatFieldValue(field, start!, range, locale),
      formatFieldValue(field, end!, range, locale)
    );
  }

  if (value.includes(",")) {
    const items = value.split(",");
    const formatted = items.map((item) => {
      if (item.includes("-")) {
        const [start, end] = item.split("-");
        return `${formatFieldValue(field, start!, range, locale)}-${formatFieldValue(field, end!, range, locale)}`;
      }
      return formatFieldValue(field, item, range, locale);
    });
    return formatted.join(", ");
  }

  return `${label}: ${formatFieldValue(field, value, range, locale)}`;
}

function formatFieldValue(
  field: CronField,
  value: string,
  range: { min: number; max: number; names?: string[] },
  locale: Locale
): string {
  const num = parseInt(value);
  if (isNaN(num)) return value;

  // Use locale-aware names for months and days
  const strings = t(locale);
  if (field === "month" && num >= range.min && num <= range.max) {
    return strings.monthNames[num - 1] ?? value;
  }
  if (field === "dayOfWeek" && num >= range.min && num <= range.max) {
    return strings.dayNames[num] ?? value;
  }

  // For other fields with names from the types file, fall back to range.names
  if (range.names && num >= range.min && num <= range.max) {
    const index = field === "month" ? num - 1 : num;
    return range.names[index] ?? value;
  }

  if (field === "hour") {
    return `${num.toString().padStart(2, "0")}:00`;
  }

  return value;
}

function buildHumanReadable(cron: CronExpression, locale: Locale): string {
  const strings = t(locale);
  const parts: string[] = [];

  // Time
  const minute = cron.minute;
  const hour = cron.hour;

  if (minute === "*" && hour === "*") {
    parts.push(strings.everyMinute);
  } else if (minute.startsWith("*/")) {
    const step = minute.split("/")[1];
    parts.push(strings.everyNMinutes(step));
  } else if (hour === "*" && /^\d+$/.test(minute)) {
    parts.push(strings.atMinuteOfEveryHour(minute));
  } else if (/^\d+$/.test(minute) && /^\d+$/.test(hour)) {
    const h = parseInt(hour).toString().padStart(2, "0");
    const m = parseInt(minute).toString().padStart(2, "0");
    parts.push(strings.atTime(h, m));
  } else if (/^\d+$/.test(minute) && hour.includes("-")) {
    const [start, end] = hour.split("-");
    const m = parseInt(minute).toString().padStart(2, "0");
    parts.push(strings.atMinuteFromTo(m, start, end));
  } else {
    if (minute !== "*") parts.push(strings.minuteFallback(minute));
    if (hour !== "*") parts.push(strings.hourFallback(hour));
  }

  // Day of month
  if (cron.dayOfMonth !== "*") {
    if (/^\d+$/.test(cron.dayOfMonth)) {
      parts.push(strings.onDay(cron.dayOfMonth));
    } else {
      parts.push(strings.days(cron.dayOfMonth));
    }
  }

  // Month
  if (cron.month !== "*") {
    if (/^\d+$/.test(cron.month)) {
      const idx = parseInt(cron.month) - 1;
      parts.push(strings.inMonth(strings.monthNames[idx] ?? cron.month));
    } else {
      parts.push(strings.months(cron.month));
    }
  }

  // Day of week
  if (cron.dayOfWeek !== "*") {
    if (/^\d+$/.test(cron.dayOfWeek)) {
      const idx = parseInt(cron.dayOfWeek);
      parts.push(strings.onDayOfWeek(strings.dayNames[idx] ?? cron.dayOfWeek));
    } else if (cron.dayOfWeek === "1-5") {
      parts.push(strings.mondayToFriday);
    } else if (cron.dayOfWeek === "0,6") {
      parts.push(strings.saturdaysAndSundays);
    } else {
      parts.push(strings.weekdays(cron.dayOfWeek));
    }
  }

  return parts.join(" ") || strings.everyMinute;
}

// --- Timezones ---

export interface TimezoneOption {
  id: string;
  label: string;
  offset: string;
}

export const COMMON_TIMEZONES: TimezoneOption[] = [
  { id: "UTC", label: "UTC", offset: "+00:00" },
  { id: "America/New_York", label: "US Eastern", offset: "-05:00" },
  { id: "America/Chicago", label: "US Central", offset: "-06:00" },
  { id: "America/Denver", label: "US Mountain", offset: "-07:00" },
  { id: "America/Los_Angeles", label: "US Pacific", offset: "-08:00" },
  { id: "Europe/London", label: "London", offset: "+00:00" },
  { id: "Europe/Madrid", label: "Madrid", offset: "+01:00" },
  { id: "Europe/Berlin", label: "Berlin", offset: "+01:00" },
  { id: "Europe/Paris", label: "Paris", offset: "+01:00" },
  { id: "Asia/Tokyo", label: "Tokyo", offset: "+09:00" },
  { id: "Asia/Shanghai", label: "Shanghai", offset: "+08:00" },
  { id: "Asia/Kolkata", label: "Kolkata", offset: "+05:30" },
  { id: "Australia/Sydney", label: "Sydney", offset: "+11:00" },
  { id: "Pacific/Auckland", label: "Auckland", offset: "+13:00" },
];

/** Get date components in a specific timezone using Intl API */
function getDateInTimezone(date: Date, timezone: string): { minute: number; hour: number; day: number; month: number; weekday: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "numeric",
    day: "numeric",
    month: "numeric",
    weekday: "short",
    hour12: false,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((p) => p.type === type)?.value ?? "0";

  const weekdayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  return {
    minute: parseInt(get("minute")),
    hour: parseInt(get("hour")),
    day: parseInt(get("day")),
    month: parseInt(get("month")),
    weekday: weekdayMap[get("weekday")] ?? 0,
  };
}

// --- Next Executions ---

export function calculateNextExecutions(
  expression: string,
  count: number = 5,
  timezone?: string,
  locale: Locale = "en"
): NextExecution[] {
  const validation = validateExpression(expression, locale);
  if (!validation.isValid) {
    return [];
  }

  const cron = parseExpression(expression, locale);
  const executions: NextExecution[] = [];
  const now = new Date();
  const current = new Date(now);

  // Reset seconds and milliseconds
  current.setSeconds(0);
  current.setMilliseconds(0);

  // Move to next minute
  current.setMinutes(current.getMinutes() + 1);

  let iterations = 0;
  const maxIterations = 525600; // Max 1 year of minutes

  while (executions.length < count && iterations < maxIterations) {
    const matches = timezone
      ? matchesCronInTimezone(current, cron, timezone)
      : matchesCron(current, cron);

    if (matches) {
      executions.push({
        date: new Date(current),
        formatted: timezone
          ? formatDateWithTimezone(current, timezone, locale)
          : formatDate(current, locale),
        relative: formatRelative(current, now, locale),
      });
    }

    current.setMinutes(current.getMinutes() + 1);
    iterations++;
  }

  return executions;
}

function matchesCronInTimezone(date: Date, cron: CronExpression, timezone: string): boolean {
  const tz = getDateInTimezone(date, timezone);

  return (
    matchesField(tz.minute, cron.minute, 0) &&
    matchesField(tz.hour, cron.hour, 0) &&
    matchesField(tz.day, cron.dayOfMonth, 1) &&
    matchesField(tz.month, cron.month, 1) &&
    matchesField(tz.weekday, cron.dayOfWeek, 0)
  );
}

function matchesCron(date: Date, cron: CronExpression): boolean {
  const minute = date.getMinutes();
  const hour = date.getHours();
  const dayOfMonth = date.getDate();
  const month = date.getMonth() + 1; // JavaScript months are 0-indexed
  const dayOfWeek = date.getDay();

  return (
    matchesField(minute, cron.minute, 0) &&
    matchesField(hour, cron.hour, 0) &&
    matchesField(dayOfMonth, cron.dayOfMonth, 1) &&
    matchesField(month, cron.month, 1) &&
    matchesField(dayOfWeek, cron.dayOfWeek, 0)
  );
}

function matchesField(value: number, pattern: string, min: number): boolean {
  if (pattern === "*") return true;

  // Step: */n or m/n
  if (pattern.includes("/")) {
    const [base, stepStr] = pattern.split("/");
    const step = parseInt(stepStr ?? "1");
    const start = base === "*" ? min : parseInt(base ?? "0");
    return (value - start) % step === 0 && value >= start;
  }

  // List: n,m,o
  if (pattern.includes(",")) {
    const items = pattern.split(",");
    return items.some((item) => {
      if (item.includes("-")) {
        const [start, end] = item.split("-");
        return value >= parseInt(start ?? "0") && value <= parseInt(end ?? "0");
      }
      return value === parseInt(item);
    });
  }

  // Range: n-m
  if (pattern.includes("-")) {
    const [start, end] = pattern.split("-");
    return value >= parseInt(start ?? "0") && value <= parseInt(end ?? "0");
  }

  // Single value
  return value === parseInt(pattern);
}

function formatDate(date: Date, locale: Locale = "en"): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return date.toLocaleDateString(t(locale).intlLocale, options);
}

function formatDateWithTimezone(date: Date, timezone: string, locale: Locale = "en"): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
    timeZoneName: "short",
  };
  return date.toLocaleDateString(t(locale).intlLocale, options);
}

function formatRelative(date: Date, now: Date, locale: Locale = "en"): string {
  const strings = t(locale);
  const diffMs = date.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 60) {
    return strings.inMinutes(diffMinutes);
  }

  if (diffHours < 24) {
    const mins = diffMinutes % 60;
    if (mins > 0) {
      return strings.inHoursAndMinutes(diffHours, mins);
    }
    return strings.inHours(diffHours);
  }

  if (diffDays < 7) {
    return strings.inDays(diffDays);
  }

  const diffWeeks = Math.floor(diffDays / 7);
  return strings.inWeeks(diffWeeks);
}

// --- Utility ---

export function isValidExpression(expression: string): boolean {
  return validateExpression(expression).isValid;
}

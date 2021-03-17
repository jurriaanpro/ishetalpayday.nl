import differenceInCalendarDays from 'date-fns/differenceInCalendarDays'
import {isWeekend, setDay} from "date-fns";


export const determineNextPayDate = (payday: number): Date => {
    const currentDate = new Date()
    const currentDay = currentDate.getDate();

    if (payday >= currentDay) {
        const paydayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), payday);

        if (isWeekend(paydayDate)) {
            return setDay(paydayDate, 5, { weekStartsOn: 1 });
        }

        return paydayDate;
    }

    const nextPayDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, payday);

    if (isWeekend(nextPayDate)) {
        return setDay(nextPayDate, 5, { weekStartsOn: 1 });
    }

    return nextPayDate
}


export const determineDaysToPayDay = (nextPayDayDate: Date): number => {
    const currentDate = new Date()

    return differenceInCalendarDays(nextPayDayDate, currentDate);
}

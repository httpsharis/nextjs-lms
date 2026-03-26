import { Document, Model } from "mongoose";

interface MonthData {
    month: string;
    count: number;
}

/**
 * Counts database items for the last 12 months.
 * It groups the total count by each month.
 * * @param model - The database model to search (like Users or Courses).
 * @returns A list of months and their exact item counts.
 */

export async function generateLast12MonthsData<T extends Document>(
    model: Model<T>
): Promise<{ last12Months: MonthData[] }> {
    const last12Months: MonthData[] = [];

    // 1. Get tomorrow's exact date as our anchor
    const today = new Date();
    today.setDate(today.getDate() + 1);

    for (let i = 11; i >= 0; i--) {
        // 2. Clone the anchor and subtract days for the end
        const endDate = new Date(today);
        endDate.setDate(today.getDate() - (i * 28));

        // 3. Clone the end date and subtract 28 days for the start
        const startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 28);

        const monthYear = endDate.toLocaleString('default', {
            day: "numeric",
            month: "short",
            year: "numeric"
        });

        // 4. Ask the database
        const count = await model.countDocuments({
            createdAt: { $gte: startDate, $lt: endDate }
        });

        last12Months.push({ month: monthYear, count });
    }

    return { last12Months };
}
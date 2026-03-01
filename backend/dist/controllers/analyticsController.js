import { query } from '../db/index.js';
async function getBusinessIdFromUser(req) {
    const userId = req.user?.userId;
    if (!userId)
        return null;
    const rows = await query('SELECT id FROM businesses WHERE user_id = ?', [userId]);
    return rows[0]?.id ?? null;
}
/** Business dashboard: stats for own establishment */
export async function businessDashboard(req, res) {
    const businessId = await getBusinessIdFromUser(req);
    if (!businessId) {
        res.status(403).json({ message: 'Business not found' });
        return;
    }
    const now = new Date();
    const thisMonth = now.getMonth() + 1;
    const thisYear = now.getFullYear();
    const guestsThisMonthRows = await query(`SELECT COALESCE(SUM(number_of_guests), 0) AS total FROM guest_records WHERE business_id = ? AND MONTH(check_in) = ? AND YEAR(check_in) = ?`, [businessId, thisMonth, thisYear]);
    const guestsThisYearRows = await query(`SELECT COALESCE(SUM(number_of_guests), 0) AS total FROM guest_records WHERE business_id = ? AND YEAR(check_in) = ?`, [businessId, thisYear]);
    const nationalityBreakdown = await query(`SELECT nationality, SUM(number_of_guests) AS total FROM guest_records WHERE business_id = ? AND YEAR(check_in) = ? GROUP BY nationality ORDER BY total DESC`, [businessId, thisYear]);
    const monthlyCount = await query(`SELECT MONTH(check_in) AS month, SUM(number_of_guests) AS total FROM guest_records WHERE business_id = ? AND YEAR(check_in) = ? GROUP BY MONTH(check_in) ORDER BY month`, [businessId, thisYear]);
    const genderDist = await query(`SELECT gender, SUM(number_of_guests) AS total FROM guest_records WHERE business_id = ? AND YEAR(check_in) = ? GROUP BY gender`, [businessId, thisYear]);
    const avgStayRows = await query(`SELECT COALESCE(AVG(length_of_stay_days), 0) AS avg_days FROM guest_records WHERE business_id = ? AND YEAR(check_in) = ?`, [businessId, thisYear]);
    const transportModeRows = await query(`SELECT transportation_mode, SUM(number_of_guests) AS total FROM guest_records WHERE business_id = ? AND YEAR(check_in) = ? GROUP BY transportation_mode ORDER BY total DESC LIMIT 1`, [businessId, thisYear]);
    const toNum = (v) => (typeof v === 'number' && !Number.isNaN(v) ? v : 0);
    const arr = (v) => (Array.isArray(v) ? v : []);
    const guestsThisMonth = toNum(arr(guestsThisMonthRows)[0]?.total);
    const guestsThisYear = toNum(arr(guestsThisYearRows)[0]?.total);
    const avgStay = toNum(arr(avgStayRows)[0]?.avg_days);
    const mostCommon = arr(transportModeRows)[0]?.transportation_mode ?? null;
    res.json({
        guestsThisMonth,
        guestsThisYear,
        nationalityBreakdown: arr(nationalityBreakdown),
        monthlyCount: arr(monthlyCount),
        genderDistribution: arr(genderDist),
        averageLengthOfStay: avgStay,
        mostCommonTransport: mostCommon,
    });
}
/** Admin dashboard: system-wide stats */
export async function adminDashboard(req, res) {
    const [activeBusinesses] = await query("SELECT COUNT(*) AS count FROM users WHERE role = 'business' AND status = 'approved'");
    const now = new Date();
    const thisMonth = now.getMonth() + 1;
    const thisYear = now.getFullYear();
    const [touristsMonth] = await query('SELECT COALESCE(SUM(number_of_guests), 0) AS total FROM guest_records WHERE MONTH(check_in) = ? AND YEAR(check_in) = ?', [thisMonth, thisYear]);
    const [touristsYear] = await query('SELECT COALESCE(SUM(number_of_guests), 0) AS total FROM guest_records WHERE YEAR(check_in) = ?', [thisYear]);
    const [pendingReg] = await query("SELECT COUNT(*) AS count FROM users WHERE role = 'business' AND status = 'pending'");
    const totalBusinesses = await query("SELECT COUNT(*) AS count FROM users WHERE role = 'business' AND status = 'approved'");
    const submittedThisMonth = await query('SELECT COUNT(DISTINCT business_id) AS count FROM monthly_submissions WHERE month = ? AND year = ? AND status = ?', [thisMonth - 1 || 12, thisMonth === 1 ? thisYear - 1 : thisYear, 'locked']);
    const complianceRate = totalBusinesses?.[0]?.count > 0
        ? Math.round(((submittedThisMonth?.[0]?.count ?? 0) /
            totalBusinesses[0].count) *
            100)
        : 0;
    const topNationalities = await query(`SELECT nationality, SUM(number_of_guests) AS total FROM guest_records WHERE YEAR(check_in) = ? GROUP BY nationality ORDER BY total DESC LIMIT 5`, [thisYear]);
    const trend12Months = await query(`SELECT MONTH(check_in) AS month, YEAR(check_in) AS year, SUM(number_of_guests) AS total
     FROM guest_records WHERE check_in >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
     GROUP BY YEAR(check_in), MONTH(check_in) ORDER BY year, month`);
    res.json({
        totalActiveBusinesses: activeBusinesses?.count ?? 0,
        touristsThisMonth: touristsMonth?.total ?? 0,
        touristsThisYear: touristsYear?.total ?? 0,
        pendingRegistrations: pendingReg?.count ?? 0,
        submissionComplianceRate: complianceRate,
        topNationalities: topNationalities || [],
        touristTrend12Months: trend12Months || [],
    });
}

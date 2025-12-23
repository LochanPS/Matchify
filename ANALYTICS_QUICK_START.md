# MATCHIFY Advanced Analytics - Quick Start

## 🚀 Quick Access

**URL:** `http://localhost:3000/organizer/analytics` (development)  
**URL:** `https://matchify.app/organizer/analytics` (production)

## ✅ Requirements

- ✅ Logged in as organizer or admin
- ✅ Valid authentication token
- ✅ Backend server running
- ✅ Database connected

## 📊 What You'll See

### Advanced Analytics Dashboard with:
1. **Date Range Selection** - Preset or custom dates
2. **User Analytics** - Signups, retention, segmentation
3. **Tournament Analytics** - Creation trends, performance, formats
4. **Payment Analytics** - Revenue, success rate, by city
5. **Engagement Analytics** - Participation, completion, community
6. **Data Export** - Download as CSV
7. **Comparison** - Compare two date ranges

## 🎯 Main Features

### Date Range Selection
- **Preset Buttons**: Today, 7 Days, 30 Days, 90 Days
- **Custom Dates**: Pick any date range
- **Auto-Update**: Data refreshes when dates change

### Tabs
- **Users** - Signup trends, retention, segmentation
- **Tournaments** - Creation trends, performance, formats
- **Payments** - Revenue trends, success rate, by city
- **Engagement** - Match participation, profile completion, community

### Data Display
- **Tables** - Sortable data tables
- **Stat Cards** - Key metrics at a glance
- **Engagement Cards** - Community activity
- **Color Coding** - Success (green), Error (red)

## 📈 Key Metrics to Track

### User Metrics
- Total signups
- Signups by role (player/organizer)
- Retention rate (7d, 30d)
- User segmentation by city
- Average days active

### Tournament Metrics
- Tournaments created
- Creation trends
- Top tournaments by participants
- Tournament formats
- Entry fee analysis

### Payment Metrics
- Total revenue
- Revenue trends
- Payment success rate
- Revenue by city
- Transaction statistics

### Engagement Metrics
- Match participation
- Profile completion rate
- Community engagement
- Forum posts
- Groups and events

## 🔧 API Endpoints

All endpoints require authentication token:

```bash
# User analytics
GET /api/analytics/advanced/users?startDate=2025-12-01&endDate=2025-12-23

# Tournament analytics
GET /api/analytics/advanced/tournaments?startDate=2025-12-01&endDate=2025-12-23

# Payment analytics
GET /api/analytics/advanced/payments?startDate=2025-12-01&endDate=2025-12-23

# Engagement analytics
GET /api/analytics/advanced/engagement?startDate=2025-12-01&endDate=2025-12-23

# Compare two periods
GET /api/analytics/advanced/comparison?startDate1=2025-11-01&endDate1=2025-11-30&startDate2=2025-12-01&endDate2=2025-12-23

# Export data
GET /api/analytics/advanced/export?type=users&startDate=2025-12-01&endDate=2025-12-23
```

## 💡 Tips

1. **Daily Check** - Review metrics every morning
2. **Trends** - Look for patterns over time
3. **Comparisons** - Compare periods to see growth
4. **Export** - Download data for deeper analysis
5. **Segments** - Analyze by city and role

## 🆘 Troubleshooting

### Dashboard Not Loading?
- Check authentication token
- Verify user role (organizer/admin)
- Check browser console for errors
- Verify API server is running

### Data Not Showing?
- Check date range is correct
- Verify data exists for selected period
- Try refreshing the page
- Check network connection

### Export Not Working?
- Verify data exists for date range
- Check browser download settings
- Try different export type
- Check file permissions

## 📞 Support

For issues:
1. Check this guide
2. Review error messages
3. Check browser console
4. Contact support team

---

**Status:** ✅ Production Ready  
**Last Updated:** December 23, 2025  
**Version:** 1.0

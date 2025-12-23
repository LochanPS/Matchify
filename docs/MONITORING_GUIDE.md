# MATCHIFY Monitoring Dashboard Guide

## Overview

The MATCHIFY Monitoring Dashboard provides real-time insights into system health, performance, and business metrics. It's designed for organizers and admins to track platform performance and identify issues quickly.

## Accessing the Dashboard

**URL:** `/organizer/monitoring`

**Requirements:**
- Must be logged in as an organizer or admin
- Valid authentication token required

## Dashboard Features

### 1. System Health Card

Shows overall system status with three indicators:

- **Database**: Connection status (Connected/Disconnected)
- **Memory**: Memory health (Healthy/Critical)
- **Performance**: Performance status (Good/Degraded)

**Status Indicators:**
- 🟢 **Healthy**: All systems operational
- 🟡 **Degraded**: Some issues detected
- 🔴 **Unhealthy**: Critical issues

### 2. Key Metrics Grid

Displays important business metrics:

- **Total Users**: Total signups with breakdown by role
- **Tournaments**: Total tournaments with status breakdown
- **Revenue**: Total revenue with transaction details
- **Registrations**: Total registrations with active count

Each metric shows:
- Current value
- Breakdown details
- 24-hour trend

### 3. Alerts Section

Shows active alerts and warnings:

- **Critical Alerts**: Require immediate action
  - Error rate > 5%
  - API response time (p95) > 1000ms
  - Memory usage > 90%

- **Warning Alerts**: Monitor closely
  - Error rate > 2%
  - API response time (p95) > 500ms
  - Memory usage > 80%

### 4. Tab Navigation

#### Overview Tab
- System health status
- Key business metrics
- User and tournament counts
- Revenue tracking

#### Performance Tab
- API response times (avg, p50, p95, p99)
- Database query times (avg, p50, p95, p99)
- Memory usage details
- Error metrics

#### Users Tab
- User statistics by role
- New users in 24 hours
- Active users in 24 hours
- Signup trends

#### Business Tab
- Payment metrics and trends
- Tournament metrics and trends
- Revenue tracking
- Transaction success rate

## Real-Time Updates

### Refresh Intervals

Choose how often data updates:
- **5 seconds**: Real-time monitoring (high CPU usage)
- **10 seconds**: Balanced monitoring
- **30 seconds**: Standard monitoring
- **1 minute**: Low-frequency monitoring

### Manual Refresh

Click the "🔄 Refresh Now" button to immediately fetch latest data.

## Understanding Metrics

### Performance Metrics

**API Response Times:**
- **Avg**: Average response time across all requests
- **P50**: 50th percentile (median)
- **P95**: 95th percentile (most users experience this or better)
- **P99**: 99th percentile (worst case for most users)

**Targets:**
- P95 < 200ms (good)
- P95 < 500ms (acceptable)
- P95 > 1000ms (critical)

**Database Query Times:**
- **Avg**: Average query time
- **P50**: Median query time
- **P95**: 95th percentile query time
- **P99**: 99th percentile query time

**Targets:**
- P95 < 100ms (good)
- P95 < 500ms (acceptable)
- P95 > 1000ms (critical)

### Memory Usage

- **Heap Used**: Current memory in use (MB)
- **Heap Total**: Total allocated memory (MB)
- **Usage %**: Percentage of heap in use
- **RSS**: Resident Set Size (total memory)

**Targets:**
- Usage < 50%: Healthy
- Usage 50-80%: Monitor
- Usage > 80%: Warning
- Usage > 90%: Critical

### Error Metrics

- **Error Rate**: Percentage of requests that failed
- **Total Errors**: Total error count
- **Unique Types**: Number of different error types
- **Last Hour**: Errors in the last hour

**Targets:**
- Error Rate < 0.5%: Healthy
- Error Rate 0.5-2%: Monitor
- Error Rate > 2%: Warning
- Error Rate > 5%: Critical

### Business Metrics

**User Metrics:**
- Total users (all time)
- Players vs Organizers
- New users in 24 hours
- Active users in 24 hours

**Tournament Metrics:**
- Total tournaments
- Active tournaments
- Completed tournaments
- New tournaments in 24 hours
- Average entry fee

**Payment Metrics:**
- Total revenue
- Total transactions
- Successful transactions
- Failed transactions
- Success rate
- Transactions in 24 hours

## Interpreting Alerts

### Critical Alerts (Red)

**Action Required:** Immediate investigation and resolution

Examples:
- "High error rate: 7.5%"
- "Slow API response time: 1200ms (p95)"
- "Critical memory usage: 92%"

**What to do:**
1. Check system logs
2. Identify the cause
3. Take corrective action
4. Monitor for resolution

### Warning Alerts (Yellow)

**Action Required:** Monitor and investigate

Examples:
- "Elevated error rate: 3.2%"
- "Elevated API response time: 650ms (p95)"
- "High memory usage: 85%"

**What to do:**
1. Monitor the metric
2. Investigate if trend continues
3. Plan optimization if needed
4. Document the issue

## Common Issues and Solutions

### High Error Rate

**Possible Causes:**
- Database connection issues
- API endpoint errors
- Invalid user input
- External service failures

**Solutions:**
1. Check database connection
2. Review error logs
3. Check external service status
4. Verify recent deployments

### Slow API Response Times

**Possible Causes:**
- Database query performance
- High server load
- Network latency
- Inefficient code

**Solutions:**
1. Check database query times
2. Review slow queries
3. Check server CPU/memory
4. Optimize code if needed

### High Memory Usage

**Possible Causes:**
- Memory leak
- Large data processing
- Too many concurrent requests
- Inefficient caching

**Solutions:**
1. Check for memory leaks
2. Monitor memory trend
3. Restart service if needed
4. Optimize code

## API Endpoints

### Dashboard Data
```
GET /api/monitoring/dashboard
```
Returns comprehensive dashboard data including system health, performance, and business metrics.

### Performance Metrics
```
GET /api/monitoring/performance
```
Returns detailed performance metrics for API and database.

### System Health
```
GET /api/monitoring/health
```
Returns current system health status.

### Error Logs
```
GET /api/monitoring/errors?limit=50&offset=0
```
Returns error logs with pagination.

### User Metrics
```
GET /api/monitoring/users
```
Returns user statistics and trends.

### Tournament Metrics
```
GET /api/monitoring/tournaments
```
Returns tournament statistics and trends.

### Payment Metrics
```
GET /api/monitoring/payments
```
Returns payment statistics and trends.

### Alerts
```
GET /api/monitoring/alerts
```
Returns active alerts and warnings.

## Best Practices

### Daily Monitoring

1. **Morning Check**: Review overnight metrics
2. **Peak Hours**: Monitor during high traffic
3. **Evening Review**: Check daily trends
4. **Weekly Summary**: Review weekly trends

### Alert Response

1. **Critical Alerts**: Respond within 15 minutes
2. **Warning Alerts**: Respond within 1 hour
3. **Info Alerts**: Review daily

### Performance Optimization

1. **Track Trends**: Monitor metrics over time
2. **Identify Patterns**: Look for recurring issues
3. **Plan Improvements**: Schedule optimization work
4. **Measure Impact**: Verify improvements

### Documentation

1. **Log Issues**: Document all incidents
2. **Track Resolutions**: Record what fixed issues
3. **Share Learnings**: Communicate findings
4. **Update Procedures**: Improve processes

## Troubleshooting

### Dashboard Not Loading

**Check:**
1. Authentication token is valid
2. User has organizer/admin role
3. API server is running
4. Network connection is stable

### Data Not Updating

**Check:**
1. Refresh interval is set correctly
2. Click "Refresh Now" button
3. Check browser console for errors
4. Verify API endpoints are responding

### Metrics Showing Errors

**Check:**
1. Database connection is active
2. Error logs table exists
3. Sufficient disk space
4. No database locks

## Support

For issues or questions:
1. Check this guide
2. Review error logs
3. Contact support team
4. Check system status page

---

**Last Updated:** December 22, 2025  
**Version:** 1.0  
**Status:** Production Ready

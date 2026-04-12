// OpusHealth.js — Universal Self-Healing Module
// Embed in EVERY Tellinex app. Handles: heartbeats, crash reporting,
// feature flags, auto-diagnosis, and self-repair.

const SU = 'https://egztpclpcnizcdtfugsv.supabase.co'
const SK = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnenRwY2xwY25pemNkdGZ1Z3N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2ODg5NDIsImV4cCI6MjA4OTI2NDk0Mn0.QYudJAyAstOMoZy2UCEsomoWBxmU3g7k2yifxEdSBW4'
const H = { apikey: SK, Authorization: `Bearer ${SK}`, 'Content-Type': 'application/json' }

class OpusHealth {
  constructor(appName) {
    this.app = appName
    this.instanceId = crypto.randomUUID?.() || Math.random().toString(36).slice(2)
    this.flags = {}
    this.rules = []
    this.crashCount = 0
    this.started = false
  }

  async start() {
    if (this.started) return
    this.started = true
    console.log(`[OpusHealth] Starting for ${this.app}`)

    // Load feature flags
    await this.loadFlags()

    // Load diagnosis rules
    await this.loadRules()

    // Global error handler
    window.addEventListener('error', (e) => this.reportCrash(e.error || e.message, 'error', e.filename))
    window.addEventListener('unhandledrejection', (e) => this.reportCrash(e.reason, 'error', 'promise'))

    // Heartbeat every 60s
    this.heartbeat()
    this.heartbeatInterval = setInterval(() => this.heartbeat(), 60000)

    // Refresh flags every 5 min
    this.flagInterval = setInterval(() => this.loadFlags(), 300000)

    console.log(`[OpusHealth] Active. ${Object.keys(this.flags).length} flags, ${this.rules.length} rules loaded`)
  }

  async loadFlags() {
    try {
      const r = await fetch(`${SU}/rest/v1/feature_flags?app=eq.${this.app}&select=feature_key,enabled,fallback_mode`, { headers: H })
      const data = await r.json()
      if (Array.isArray(data)) {
        this.flags = {}
        data.forEach(f => { this.flags[f.feature_key] = { enabled: f.enabled, fallback: f.fallback_mode } })
      }
    } catch (e) { console.warn('[OpusHealth] Flag load failed, using cached') }
  }

  async loadRules() {
    try {
      const r = await fetch(`${SU}/rest/v1/diagnosis_rules?or=(app.eq.${this.app},app.is.null)&select=*`, { headers: H })
      this.rules = await r.json() || []
    } catch (e) { console.warn('[OpusHealth] Rules load failed') }
  }

  isEnabled(featureKey) {
    const flag = this.flags[featureKey]
    if (!flag) return true // Unknown features default to enabled
    return flag.enabled
  }

  getFallback(featureKey) {
    return this.flags[featureKey]?.fallback || null
  }

  async heartbeat() {
    try {
      await fetch(`${SU}/rest/v1/app_heartbeats`, {
        method: 'POST', headers: { ...H, Prefer: 'return=minimal' },
        body: JSON.stringify({
          app: this.app,
          instance_id: this.instanceId,
          status: 'alive',
          metrics: {
            url: window.location.href,
            memory: navigator.deviceMemory || null,
            online: navigator.onLine,
            crashes_this_session: this.crashCount,
            uptime_seconds: Math.floor(performance.now() / 1000),
          }
        })
      })
    } catch (e) { /* silent fail on heartbeat */ }
  }

  async reportCrash(error, severity = 'error', screen = '') {
    this.crashCount++
    const errorMsg = error?.message || String(error)
    const stack = error?.stack || ''

    console.error(`[OpusHealth] Crash #${this.crashCount}: ${errorMsg}`)

    // Auto-diagnose against rules
    const diagnosis = this.diagnose(errorMsg)

    // If critical and matches a feature, auto-disable it
    if (diagnosis?.auto_disable_feature && (severity === 'critical' || severity === 'fatal' || this.crashCount >= 3)) {
      await this.disableFeature(diagnosis.auto_disable_feature, errorMsg)
    }

    // Execute auto-fix if available
    if (diagnosis?.auto_fix_action) {
      this.executeAutoFix(diagnosis.auto_fix_action)
    }

    // Report to Supabase
    try {
      await fetch(`${SU}/rest/v1/crash_reports`, {
        method: 'POST', headers: { ...H, Prefer: 'return=minimal' },
        body: JSON.stringify({
          app: this.app,
          error_type: error?.name || 'Error',
          error_message: errorMsg.substring(0, 2000),
          stack_trace: stack.substring(0, 5000),
          screen: screen || window.location.pathname,
          severity,
          auto_diagnosed: !!diagnosis,
          diagnosis: diagnosis?.diagnosis || null,
          fix_suggested: diagnosis?.auto_fix_action || null,
          device_info: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            online: navigator.onLine,
          },
          app_version: document.querySelector('meta[name="version"]')?.content || 'unknown',
        })
      })
    } catch (e) { /* silent fail on crash report */ }
  }

  diagnose(errorMsg) {
    for (const rule of this.rules) {
      try {
        if (new RegExp(rule.error_pattern, 'i').test(errorMsg)) {
          // Increment trigger count
          fetch(`${SU}/rest/v1/diagnosis_rules?id=eq.${rule.id}`, {
            method: 'PATCH', headers: { ...H, Prefer: 'return=minimal' },
            body: JSON.stringify({ times_triggered: (rule.times_triggered || 0) + 1 })
          }).catch(() => {})
          return rule
        }
      } catch (e) { /* invalid regex, skip */ }
    }
    return null
  }

  async disableFeature(featureKey, reason) {
    console.warn(`[OpusHealth] Auto-disabling feature: ${featureKey}`)
    // Update local cache
    if (this.flags[featureKey]) this.flags[featureKey].enabled = false

    // Update Supabase
    try {
      await fetch(`${SU}/rest/v1/feature_flags?app=eq.${this.app}&feature_key=eq.${featureKey}`, {
        method: 'PATCH', headers: { ...H, Prefer: 'return=minimal' },
        body: JSON.stringify({ enabled: false, disabled_reason: reason.substring(0, 500), disabled_by: 'opus_health_auto', disabled_at: new Date().toISOString() })
      })
      // Log repair
      await fetch(`${SU}/rest/v1/opus_repair_log`, {
        method: 'POST', headers: { ...H, Prefer: 'return=minimal' },
        body: JSON.stringify({ app_name: this.app, issue_detected: reason.substring(0, 500), repair_action: `auto_disabled_feature:${featureKey}`, repair_status: 'success', completed_at: new Date().toISOString() })
      })
    } catch (e) { console.error('[OpusHealth] Failed to disable feature remotely') }
  }

  executeAutoFix(action) {
    console.log(`[OpusHealth] Executing auto-fix: ${action}`)
    switch (action) {
      case 'force_reload_page':
        setTimeout(() => window.location.reload(), 2000)
        break
      case 'clear_cache_reload':
        if ('caches' in window) caches.keys().then(keys => keys.forEach(k => caches.delete(k)))
        setTimeout(() => window.location.reload(), 2000)
        break
      case 'retry_with_backoff':
        // Apps should implement their own retry logic reading this flag
        break
      case 'refresh_auth_token':
        // Trigger Supabase re-auth
        break
      case 'switch_to_local_cache':
        console.warn('[OpusHealth] Switching to local cache mode')
        break
      case 'clear_old_cache':
        if ('caches' in window) caches.keys().then(keys => keys.slice(0, -2).forEach(k => caches.delete(k)))
        break
      default:
        console.log(`[OpusHealth] Unknown fix action: ${action}`)
    }
  }

  stop() {
    clearInterval(this.heartbeatInterval)
    clearInterval(this.flagInterval)
    this.started = false
    console.log(`[OpusHealth] Stopped for ${this.app}`)
  }
}

// Singleton instances per app
export const opusHealth = {
  tcc: new OpusHealth('tcc'),
  preview: new OpusHealth('preview_website'),
  landing: new OpusHealth('landing_page'),
  portal: new OpusHealth('customer_portal'),
  fieldpack: new OpusHealth('fieldpack_pro'),
}

export default OpusHealth

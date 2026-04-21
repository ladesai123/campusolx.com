'use client'

import { useState } from 'react'

/**
 * /sso-test  — Internal developer tool
 *
 * Simulates the Unify "Campus Olex" button. Enter a reg_no → generates a
 * real signed JWT → tests the full SSO flow end-to-end. Use this to verify
 * everything works before sharing credentials with the Unify team.
 */

interface TokenResult {
  token: string
  derivedEmail: string
  payload: {
    reg_no: string
    name: string
    jti: string
    iat: number
    exp: number
  }
}

export default function SSOTestPage() {
  const [regNo, setRegNo] = useState('126156075')
  const [name, setName] = useState('Ravi Anand')
  const [result, setResult] = useState<TokenResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const generateToken = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/sso-test-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regNo, name }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to generate token')
        return
      }
      setResult(data)
    } catch {
      setError('Network error — is the dev server running?')
    } finally {
      setLoading(false)
    }
  }

  const ssoUrl = result
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/sso?token=${result.token}`
    : null

  const copyToken = () => {
    if (result?.token) {
      navigator.clipboard.writeText(result.token)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatTime = (unix: number) =>
    new Date(unix * 1000).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    })

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', fontFamily: "'Inter', system-ui, sans-serif", padding: '2rem' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '8px 20px', marginBottom: 20 }}>
            <span style={{ fontSize: 20 }}>🔗</span>
            <span style={{ color: '#a78bfa', fontSize: 13, fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase' }}>Developer Testing Tool</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>
            Unify × CampusOlx SSO
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 15, margin: 0 }}>
            Simulate the Unify &ldquo;Campus Olex&rdquo; button and test the full login flow
          </p>
        </div>

        {/* Flow diagram */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          {['Unify App', '→', 'reg_no JWT', '→', '/auth/sso', '→', 'Supabase', '→', '/home ✅'].map((step, i) => (
            <span
              key={i}
              style={{
                padding: step === '→' ? '0 4px' : '6px 14px',
                background: step === '→' ? 'transparent' : 'rgba(167,139,250,0.15)',
                border: step === '→' ? 'none' : '1px solid rgba(167,139,250,0.3)',
                borderRadius: 8,
                color: step === '→' ? '#64748b' : '#c4b5fd',
                fontSize: 13,
                fontWeight: step === '→' ? 400 : 600,
              }}
            >
              {step}
            </span>
          ))}
        </div>

        {/* Form card */}
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '2rem', marginBottom: '1.5rem', backdropFilter: 'blur(20px)' }}>
          <h2 style={{ color: '#e2e8f0', fontSize: 17, fontWeight: 700, margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>📦</span> Simulated Unify JWT Payload
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {/* reg_no field */}
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, fontWeight: 600, marginBottom: 6, letterSpacing: 0.5 }}>
                REG NO <span style={{ color: '#64748b', fontWeight: 400 }}>(Unify sends this, we derive email)</span>
              </label>
              <input
                suppressHydrationWarning
                type="text"
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
                placeholder="126156075"
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '12px 16px',
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 10, color: '#f1f5f9', fontSize: 15, outline: 'none',
                  fontFamily: 'monospace',
                }}
              />
              <p style={{ color: '#4ade80', fontSize: 12, margin: '5px 0 0' }}>
                → Derived email: <code style={{ fontFamily: 'monospace' }}>{regNo || '...'}{regNo ? '@sastra.ac.in' : ''}</code>
              </p>
              <p style={{ color: '#64748b', fontSize: 12, margin: '2px 0 0' }}>
                Profile picture will be the first letter of the name (initials avatar)
              </p>
            </div>

            {/* name field */}
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, fontWeight: 600, marginBottom: 6, letterSpacing: 0.5 }}>
                FULL NAME
              </label>
              <input
                suppressHydrationWarning
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '12px 16px',
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 10, color: '#f1f5f9', fontSize: 15, outline: 'none',
                }}
              />
            </div>

            {/* Info box — what Unify does NOT need to send */}
            <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 10, padding: '10px 14px' }}>
              <p style={{ color: '#a5b4fc', fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                <strong>ℹ️ Tell Unify team:</strong> Only send <code style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 5px', borderRadius: 4 }}>reg_no</code> and <code style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 5px', borderRadius: 4 }}>name</code>.
                No email, no photo needed. CampusOlx handles the rest.
              </p>
            </div>
          </div>

          <button
            suppressHydrationWarning
            onClick={generateToken}
            disabled={loading || !regNo || !name}
            style={{
              width: '100%', marginTop: '1.5rem', padding: '14px 24px',
              background: loading ? 'rgba(139,92,246,0.4)' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              border: 'none', borderRadius: 12, color: '#fff', fontSize: 16,
              fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              opacity: (!regNo || !name) ? 0.5 : 1,
            }}
          >
            {loading ? (
              <>
                <span style={{ display: 'inline-block', width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                Generating JWT…
              </>
            ) : (
              <>⚡ Generate &amp; Test SSO</>
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
            <p style={{ color: '#fca5a5', margin: 0, fontSize: 14 }}>❌ {error}</p>
          </div>
        )}

        {/* Result */}
        {result && ssoUrl && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* JWT Payload preview */}
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '1.5rem' }}>
              <h3 style={{ color: '#a78bfa', fontSize: 14, fontWeight: 700, margin: '0 0 1rem', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                📦 JWT Payload (what Unify sends)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[
                  { label: 'reg_no', value: result.payload.reg_no },
                  { label: 'derived email', value: result.derivedEmail },
                  { label: 'name', value: result.payload.name },
                  { label: 'photo', value: 'Not sent → initials avatar' },
                  { label: 'jti', value: result.payload.jti.slice(0, 18) + '…' },
                  { label: 'exp', value: formatTime(result.payload.exp) + ' (+10 min)' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 12px' }}>
                    <p style={{ color: '#64748b', fontSize: 11, fontWeight: 600, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</p>
                    <p style={{ color: label === 'photo' ? '#64748b' : '#e2e8f0', fontSize: 13, margin: 0, fontFamily: ['reg_no', 'derived email', 'jti'].includes(label) ? 'monospace' : 'inherit', wordBreak: 'break-all', fontStyle: label === 'photo' ? 'italic' : 'normal' }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Token */}
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ color: '#a78bfa', fontSize: 14, fontWeight: 700, margin: 0, letterSpacing: 0.5, textTransform: 'uppercase' }}>🔑 Signed JWT Token</h3>
                <button
                  suppressHydrationWarning
                  onClick={copyToken}
                  style={{ background: copied ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '5px 12px', color: copied ? '#34d399' : '#94a3b8', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
                >
                  {copied ? '✅ Copied!' : '📋 Copy'}
                </button>
              </div>
              <p style={{ color: '#64748b', fontSize: 12, margin: '0 0 8px' }}>
                Fresh jti generated each click — each token can only be used once.
              </p>
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '12px', overflowX: 'auto' }}>
                <code style={{ color: '#86efac', fontSize: 11, wordBreak: 'break-all', fontFamily: 'monospace', lineHeight: 1.6 }}>
                  {result.token}
                </code>
              </div>
            </div>

            {/* THE BIG TEST BUTTON */}
            <a
              href={ssoUrl}
              style={{
                display: 'block', textAlign: 'center', padding: '18px 24px',
                background: 'linear-gradient(135deg, #059669, #047857)',
                borderRadius: 16, color: '#fff', fontSize: 17,
                fontWeight: 800, textDecoration: 'none',
                boxShadow: '0 4px 24px rgba(5,150,105,0.35)',
              }}
            >
              🚀 Tap to Test SSO Login
              <span style={{ display: 'block', fontSize: 13, fontWeight: 400, opacity: 0.8, marginTop: 4 }}>
                → hits /auth/sso → verifies JWT → logs in → /home
              </span>
            </a>

            {/* Test checklist */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.5rem' }}>
              <h3 style={{ color: '#94a3b8', fontSize: 14, fontWeight: 700, margin: '0 0 1rem', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                ✅ Test Checklist
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {[
                  ['First click above', 'Land on /home fully logged in ✅'],
                  ['Click the same link again', '"This link was already used" error ✅'],
                  ['New reg_no (never used CampusOlx)', 'Account + profile created → /home ✅'],
                  ['Existing reg_no (already on CampusOlx)', 'Existing account reused → /home ✅'],
                  ['Tamper with the token manually', '"Invalid SSO link" error ✅'],
                ].map(([test, expected]) => (
                  <div key={test} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 12px' }}>
                    <span style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600 }}>{test}</span>
                    <span style={{ color: '#64748b', fontSize: 12, textAlign: 'right' }}>{expected}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Footer */}
        <p style={{ textAlign: 'center', color: '#334155', fontSize: 12, marginTop: '2rem' }}>
          🔒 Internal developer tool — do not share this URL publicly.
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus { border-color: rgba(139,92,246,0.6) !important; box-shadow: 0 0 0 3px rgba(139,92,246,0.15); }
      `}</style>
    </div>
  )
}

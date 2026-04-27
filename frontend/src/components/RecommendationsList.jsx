import { motion } from 'framer-motion';

export default function RecommendationsList({ fixes, loading, error }) {
  return (
    <motion.div
      className="glass-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: '24px' }}
    >
      <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>
        Suggested Fixes
      </h3>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
        Prioritized mitigation plan from Gemini.
      </p>

      {loading && (
        <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>⟳ Generating mitigation plan...</div>
      )}

      {error && (
        <div style={{
          background: 'rgba(244,63,94,0.1)',
          border: '1px solid rgba(244,63,94,0.35)',
          borderRadius: '10px',
          padding: '10px 12px',
          color: '#f43f5e',
          fontSize: '13px',
        }}>
          {error}
        </div>
      )}

      {!loading && !error && fixes && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Priority Actions
            </p>
            <ol style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-primary)', fontSize: '14px' }}>
              {(fixes.priority_actions || []).map((item) => (
                <li key={item} style={{ marginBottom: '6px' }}>{item}</li>
              ))}
            </ol>
          </div>

          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Short-Term Plan
            </p>
            <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-secondary)', fontSize: '13px' }}>
              {(fixes.short_term_plan || []).map((item) => (
                <li key={item} style={{ marginBottom: '4px' }}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Risk Tradeoffs
            </p>
            <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-secondary)', fontSize: '13px' }}>
              {(fixes.risk_tradeoffs || []).map((item) => (
                <li key={item} style={{ marginBottom: '4px' }}>{item}</li>
              ))}
            </ul>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{fixes.notes}</p>
        </div>
      )}
    </motion.div>
  );
}

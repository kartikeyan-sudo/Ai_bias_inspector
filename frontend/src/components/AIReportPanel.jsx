import { motion } from 'framer-motion';

export default function AIReportPanel({ report, loading, error }) {
  return (
    <motion.div
      className="glass-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: '24px' }}
    >
      <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>
        AI Bias Explanation
      </h3>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
        Gemini-generated explanation based on measured fairness metrics.
      </p>

      {loading && (
        <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>⟳ Generating explanation...</div>
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

      {!loading && !error && report && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Executive Summary
            </p>
            <p style={{ fontSize: '14px', lineHeight: 1.7 }}>{report.executive_summary}</p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Bias Explanation
            </p>
            <p style={{ fontSize: '14px', lineHeight: 1.7 }}>{report.bias_explanation}</p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Root Causes
            </p>
            <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-secondary)', fontSize: '13px' }}>
              {(report.root_causes || []).map((cause) => (
                <li key={cause} style={{ marginBottom: '4px' }}>{cause}</li>
              ))}
            </ul>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Proxy Risk Features
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {(report.proxy_risk_features || []).map((feature) => (
                <span key={feature} style={{
                  padding: '4px 10px', borderRadius: '999px',
                  background: 'rgba(245,158,11,0.12)',
                  border: '1px solid rgba(245,158,11,0.3)',
                  color: '#f59e0b', fontSize: '12px', fontWeight: '600',
                }}>
                  {feature}
                </span>
              ))}
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{report.confidence_notes}</p>
        </div>
      )}
    </motion.div>
  );
}

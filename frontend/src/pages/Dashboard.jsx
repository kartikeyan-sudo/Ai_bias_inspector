import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThreeBackground from '../components/ThreeBackground';
import MetricCard from '../components/MetricCard';
import BiasCharts from '../components/BiasCharts';
import { trainModel, mitigateBias } from '../services/api';

const getBiasConfig = (level) => {
  if (level === 'Low') return {
    color: '#10b981',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.3)',
    icon: '✅',
    label: 'Low Risk',
  };
  if (level === 'Medium') return {
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.3)',
    icon: '⚠️',
    label: 'Medium Risk',
  };
  return {
    color: '#f43f5e',
    bg: 'rgba(244,63,94,0.1)',
    border: 'rgba(244,63,94,0.3)',
    icon: '🚨',
    label: 'High Risk',
  };
};

export default function Dashboard() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [useGender, setUseGender] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upload');
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile);
      setError(null);
    } else {
      setError('Please drop a valid CSV file.');
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) { setFile(f); setError(null); }
  };

  const handleAnalyze = async () => {
    if (!file) { setError('Upload a CSV dataset first.'); return; }
    setError(null);
    setLoading(true);
    setLoadingMsg('Training model pipeline...');
    try {
      const data = await trainModel(file, useGender);
      setResults({ ...data, isMitigated: false });
      setActiveTab('results');
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    }
    setLoading(false);
  };

  const handleMitigate = async () => {
    if (!file) { setError('Upload a CSV dataset first.'); return; }
    setError(null);
    setLoading(true);
    setLoadingMsg('Applying fairness constraints...');
    try {
      const before = results;
      const data = await mitigateBias(file, useGender);
      setResults({ ...data, isMitigated: true, before });
      setActiveTab('results');
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    }
    setLoading(false);
  };

  const handleDownload = () => {
    if (!results) return;
    const report = {
      generated_at: new Date().toISOString(),
      model_type: results.isMitigated ? 'Fairness-Mitigated' : 'Standard',
      features_used: results.features_used,
      metrics: {
        accuracy: results.accuracy,
        bias_level: results.bias_level,
        bias_difference: results.bias_difference,
        female_selection_rate: results.female_rate,
        male_selection_rate: results.male_rate,
        demographic_parity_difference: results.demographic_parity_diff,
        equal_opportunity_difference: results.equal_opportunity_diff,
      },
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'ai_bias_report.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const biasConfig = results ? getBiasConfig(results.bias_level) : null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative' }}>
      {/* Three.js animated background */}
      <ThreeBackground />

      {/* Gradient overlays */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'radial-gradient(ellipse at 20% 20%, rgba(79,142,247,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(139,92,246,0.08) 0%, transparent 60%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Content */}
      <div className="content-layer" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <header style={{
          padding: '0 48px',
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
          background: 'rgba(5,8,22,0.6)',
          position: 'sticky', top: 0, zIndex: 100,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '40px', height: '40px',
              background: 'linear-gradient(135deg, #4f8ef7, #8b5cf6)',
              borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px',
              boxShadow: '0 0 20px rgba(139,92,246,0.4)',
            }}>⚖️</div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.3px' }}>
                AI Bias Inspector
              </h1>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', letterSpacing: '1px' }}>
                FAIRNESS ANALYTICS PLATFORM
              </p>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ display: 'flex', gap: '4px' }}>
            {[
              { id: 'upload', label: '📂 Upload' },
              { id: 'results', label: '📊 Results' },
            ].map(tab => (
              <button
                key={tab.id}
                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                style={{ background: 'none', border: 'none' }}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div style={{
            padding: '6px 16px',
            borderRadius: '20px',
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.3)',
            fontSize: '12px',
            fontWeight: '600',
            color: '#10b981',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}
              className="pulse-glow" />
            API LIVE
          </div>
        </header>

        {/* Main */}
        <main style={{ flex: 1, padding: '40px 48px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>

          <AnimatePresence mode="wait">

            {/* ─── UPLOAD TAB ─── */}
            {activeTab === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {/* Hero */}
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                  <motion.div
                    className="float"
                    style={{ fontSize: '64px', marginBottom: '24px', display: 'inline-block' }}
                  >⚖️</motion.div>
                  <h2 style={{ fontSize: '48px', fontWeight: '800', lineHeight: 1.1, marginBottom: '16px', letterSpacing: '-1px' }}>
                    Detect AI Bias{' '}
                    <span className="gradient-text">Before It Harms</span>
                  </h2>
                  <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto' }}>
                    Upload your dataset, run fairness analysis, and apply mitigation — all in one powerful platform.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', alignItems: 'start' }}>

                  {/* Upload Zone */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div
                      className={`upload-zone glass-card ${isDragging ? 'drag-over' : ''}`}
                      style={{ padding: '60px 40px', textAlign: 'center', cursor: 'pointer', borderRadius: '20px' }}
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input ref={fileInputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFileChange} />

                      <motion.div
                        animate={{ scale: isDragging ? 1.1 : 1 }}
                        style={{ fontSize: '56px', marginBottom: '20px' }}
                      >
                        {file ? '✅' : '📁'}
                      </motion.div>

                      {file ? (
                        <>
                          <p style={{ fontSize: '20px', fontWeight: '600', color: '#10b981', marginBottom: '8px' }}>
                            {file.name}
                          </p>
                          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                            {(file.size / 1024).toFixed(1)} KB · Click to change
                          </p>
                        </>
                      ) : (
                        <>
                          <p style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                            Drop your CSV dataset here
                          </p>
                          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                            or click to browse files
                          </p>
                          <div style={{
                            marginTop: '20px', padding: '8px 20px',
                            background: 'rgba(139,92,246,0.1)',
                            border: '1px solid rgba(139,92,246,0.3)',
                            borderRadius: '20px', display: 'inline-block',
                            fontSize: '12px', color: '#8b5cf6', fontWeight: '600',
                          }}>
                            Supports: CSV with income, age, gender, loan_approved columns
                          </div>
                        </>
                      )}
                    </div>

                    {/* Options */}
                    <div className="glass-card" style={{ padding: '24px' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                        Model Configuration
                      </h3>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={useGender}
                          onChange={(e) => setUseGender(e.target.checked)}
                        />
                        <div>
                          <p style={{ fontWeight: '600', fontSize: '15px' }}>Include sensitive feature (Gender)</p>
                          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            Demonstrates direct bias from sensitive attributes
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          style={{
                            background: 'rgba(244,63,94,0.1)',
                            border: '1px solid rgba(244,63,94,0.3)',
                            borderRadius: '12px', padding: '14px 18px',
                            display: 'flex', gap: '10px', alignItems: 'center',
                            color: '#f43f5e', fontSize: '14px',
                          }}
                        >
                          🚨 {error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Action buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <button
                        className="btn-primary"
                        onClick={handleAnalyze}
                        disabled={loading || !file}
                        style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                      >
                        {loading && loadingMsg.includes('Training') ? (
                          <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span> Training...</>
                        ) : '🔍 Analyze Bias'}
                      </button>
                      <button
                        className="btn-secondary"
                        onClick={handleMitigate}
                        disabled={loading || !results}
                        style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                      >
                        {loading && loadingMsg.includes('fairness') ? (
                          <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span> Mitigating...</>
                        ) : '🛡️ Mitigate Bias'}
                      </button>
                    </div>
                  </div>

                  {/* Info Panel */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="glass-card" style={{ padding: '24px' }}>
                      <div style={{ fontSize: '28px', marginBottom: '12px' }}>🧠</div>
                      <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '10px' }}>
                        Key Insight
                      </h3>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                        Even after removing sensitive features like gender, models can still learn bias through <strong style={{ color: '#8b5cf6' }}>proxy variables</strong> like income or age.
                      </p>
                    </div>

                    <div className="glass-card" style={{ padding: '24px' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                        Bias Scoring
                      </h3>
                      {[
                        { level: 'Low', range: '< 0.05', color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' },
                        { level: 'Medium', range: '0.05 – 0.15', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
                        { level: 'High', range: '> 0.15', color: '#f43f5e', bg: 'rgba(244,63,94,0.1)', border: 'rgba(244,63,94,0.3)' },
                      ].map(b => (
                        <div key={b.level} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '10px 14px', borderRadius: '10px',
                          background: b.bg, border: `1px solid ${b.border}`,
                          marginBottom: '8px',
                        }}>
                          <span style={{ color: b.color, fontWeight: '600', fontSize: '14px' }}>{b.level}</span>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontFamily: 'monospace' }}>{b.range}</span>
                        </div>
                      ))}
                    </div>

                    <div className="glass-card" style={{ padding: '24px' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>
                        Fairness Metrics
                      </h3>
                      {[
                        { icon: '📊', name: 'Selection Rate', desc: 'Group approval ratios' },
                        { icon: '⚖️', name: 'Demographic Parity', desc: 'Prediction independence' },
                        { icon: '🎯', name: 'Equal Opportunity', desc: 'True positive parity' },
                      ].map(m => (
                        <div key={m.name} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '14px' }}>
                          <span style={{ fontSize: '20px' }}>{m.icon}</span>
                          <div>
                            <p style={{ fontWeight: '600', fontSize: '14px' }}>{m.name}</p>
                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{m.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── RESULTS TAB ─── */}
            {activeTab === 'results' && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {!results ? (
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    minHeight: '60vh', gap: '20px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '64px', opacity: 0.3 }}>📊</div>
                    <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                      No Results Yet
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                      Upload a dataset and run analysis first.
                    </p>
                    <button className="btn-primary" onClick={() => setActiveTab('upload')} style={{ padding: '14px 32px' }}>
                      Go to Upload →
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Status bar */}
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      marginBottom: '32px', flexWrap: 'wrap', gap: '12px',
                    }}>
                      <div>
                        <h2 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>
                          Analysis Results
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
                          {results.isMitigated ? '🛡️ Fairness-mitigated model' : '🔍 Standard model'} ·{' '}
                          Features: {results.features_used?.join(', ')}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                          className="btn-secondary"
                          onClick={handleDownload}
                          style={{ padding: '12px 24px', fontSize: '14px' }}
                        >
                          ⬇️ Export Report
                        </button>
                        <button
                          className="btn-primary"
                          onClick={() => setActiveTab('upload')}
                          style={{ padding: '12px 24px', fontSize: '14px' }}
                        >
                          ← New Analysis
                        </button>
                      </div>
                    </div>

                    {/* Bias level hero */}
                    <motion.div
                      className="glass-card animated-border"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      style={{
                        padding: '32px 40px', marginBottom: '24px',
                        background: biasConfig.bg,
                        border: `1px solid ${biasConfig.border}`,
                        display: 'flex', alignItems: 'center', gap: '32px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ fontSize: '56px' }}>{biasConfig.icon}</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                          Overall Bias Assessment
                        </p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', flexWrap: 'wrap' }}>
                          <span className="stat-number" style={{ fontSize: '48px', fontWeight: '800', color: biasConfig.color }}>
                            {results.bias_level}
                          </span>
                          <span style={{ fontSize: '20px', color: 'var(--text-secondary)' }}>
                            Bias Score: <strong style={{ color: biasConfig.color }}>
                              {results.bias_difference.toFixed(4)}
                            </strong>
                          </span>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div style={{ minWidth: '200px' }}>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                          Bias level indicator
                        </p>
                        <div className="progress-bar">
                          <motion.div
                            className="progress-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(results.bias_difference * 500, 100)}%` }}
                            transition={{ duration: 1.2, ease: 'easeOut' }}
                            style={{ background: `linear-gradient(90deg, ${biasConfig.color}, ${biasConfig.color}88)` }}
                          />
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px', textAlign: 'right' }}>
                          {(results.bias_difference * 100).toFixed(1)}% disparity
                        </p>
                      </div>
                    </motion.div>

                    {/* KPI Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                      <MetricCard
                        title="Model Accuracy"
                        value={`${(results.accuracy * 100).toFixed(1)}%`}
                        subtitle="Overall prediction accuracy"
                        icon="🎯"
                        colorClass={{ background: 'rgba(79,142,247,0.15)', color: '#4f8ef7' }}
                        delay={0}
                      />
                      <MetricCard
                        title="Female Approval"
                        value={`${(results.female_rate * 100).toFixed(1)}%`}
                        subtitle="Selection rate"
                        icon="♀️"
                        colorClass={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}
                        delay={0.1}
                      />
                      <MetricCard
                        title="Male Approval"
                        value={`${(results.male_rate * 100).toFixed(1)}%`}
                        subtitle="Selection rate"
                        icon="♂️"
                        colorClass={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4' }}
                        delay={0.2}
                      />
                      <MetricCard
                        title="Dem. Parity Diff"
                        value={results.demographic_parity_diff.toFixed(3)}
                        subtitle="Lower is fairer"
                        icon="⚖️"
                        colorClass={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}
                        delay={0.3}
                      />
                      <MetricCard
                        title="Equal Opp. Diff"
                        value={results.equal_opportunity_diff.toFixed(3)}
                        subtitle="True positive parity"
                        icon="🎓"
                        colorClass={{ background: 'rgba(244,63,94,0.15)', color: '#f43f5e' }}
                        delay={0.4}
                      />
                    </div>

                    {/* Charts + Mitigation */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
                      <BiasCharts results={results} />

                      {/* Sidebar actions */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {!results.isMitigated && (
                          <motion.div
                            className="glass-card"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            style={{ padding: '24px' }}
                          >
                            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '10px' }}>
                              🛡️ Apply Mitigation
                            </h3>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.7 }}>
                              Use Fairlearn's ThresholdOptimizer to apply demographic parity constraints and reduce bias.
                            </p>
                            <button
                              className="btn-secondary"
                              onClick={handleMitigate}
                              disabled={loading}
                              style={{ padding: '14px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                              {loading ? '⟳ Applying...' : '🛡️ Mitigate Bias'}
                            </button>
                          </motion.div>
                        )}

                        {results.isMitigated && results.before && (
                          <motion.div
                            className="glass-card"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            style={{
                              padding: '24px',
                              background: 'rgba(16,185,129,0.05)',
                              border: '1px solid rgba(16,185,129,0.2)',
                            }}
                          >
                            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#10b981', marginBottom: '16px' }}>
                              ✅ Mitigation Applied
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {[
                                {
                                  label: 'Bias Difference',
                                  before: results.before.bias_difference,
                                  after: results.bias_difference,
                                },
                                {
                                  label: 'Accuracy',
                                  before: results.before.accuracy,
                                  after: results.accuracy,
                                },
                              ].map(item => {
                                const improved = item.label === 'Bias Difference'
                                  ? item.after < item.before
                                  : item.after >= item.before;
                                return (
                                  <div key={item.label} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '12px 14px' }}>
                                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{item.label}</p>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                      <span style={{ fontFamily: 'monospace', fontSize: '14px', color: '#f43f5e' }}>
                                        {item.before.toFixed(3)}
                                      </span>
                                      <span style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>→</span>
                                      <span style={{ fontFamily: 'monospace', fontSize: '14px', color: '#10b981' }}>
                                        {item.after.toFixed(3)}
                                      </span>
                                      <span style={{ marginLeft: 'auto', fontSize: '16px' }}>
                                        {improved ? '✅' : '⚠️'}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}

                        {/* Feature info */}
                        <motion.div
                          className="glass-card"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 }}
                          style={{ padding: '24px' }}
                        >
                          <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>
                            Model Info
                          </h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>Type</span>
                              <span style={{ fontWeight: '600' }}>Logistic Regression</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>Mitigation</span>
                              <span style={{ fontWeight: '600', color: results.isMitigated ? '#10b981' : 'var(--text-secondary)' }}>
                                {results.isMitigated ? 'ThresholdOptimizer' : 'None'}
                              </span>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                              {results.features_used?.map(f => (
                                <span key={f} style={{
                                  padding: '4px 10px', borderRadius: '20px',
                                  background: 'rgba(139,92,246,0.1)',
                                  border: '1px solid rgba(139,92,246,0.3)',
                                  fontSize: '12px', color: '#8b5cf6', fontWeight: '500',
                                }}>{f}</span>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '20px 48px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'rgba(5,8,22,0.4)',
          fontSize: '13px', color: 'var(--text-secondary)',
        }}>
          <span>AI Bias Inspector · Built with React + FastAPI + Three.js</span>
          <span>Backend: <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" style={{ color: '#8b5cf6', textDecoration: 'none' }}>FastAPI Docs →</a></span>
        </footer>
      </div>
    </div>
  );
}

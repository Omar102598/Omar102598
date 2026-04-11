import React, { useState, useEffect } from 'react';
import { Project, Sprint, ProjectStats } from '../types';
import { getProjects, getSprints, getProjectStats } from '../services/api';
import VelocityChart from './VelocityChart';
import BurndownChart from './BurndownChart';

const AnalyticsDashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProjects()
      .then(data => {
        setProjects(data);
        if (data.length > 0) {
          setSelectedProjectId(data[0].id);
        }
      })
      .catch(err => setError('Failed to load projects: ' + err.message));
  }, []);

  useEffect(() => {
    if (!selectedProjectId) return;
    setLoading(true);
    setError(null);

    Promise.all([
      getSprints(selectedProjectId),
      getProjectStats(selectedProjectId)
    ])
      .then(([sprintsData, statsData]) => {
        setSprints(sprintsData);
        setStats(statsData);
      })
      .catch(err => setError('Failed to load project data: ' + err.message))
      .finally(() => setLoading(false));
  }, [selectedProjectId]);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header">
        <h2>Analytics Dashboard</h2>
        <select
          value={selectedProjectId}
          onChange={e => setSelectedProjectId(e.target.value)}
          className="project-selector"
        >
          <option value="">Select a project...</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading && <div className="loading">Loading analytics...</div>}

      {selectedProject && (
        <div className="project-info">
          <span className="project-name">{selectedProject.name}</span>
          <span className={`project-status status-${selectedProject.status.toLowerCase()}`}>
            {selectedProject.status}
          </span>
        </div>
      )}

      {stats && !loading && (
        <>
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-value">{stats.totalTasks}</div>
              <div className="stat-label">Total Tasks</div>
            </div>
            <div className="stat-card completed">
              <div className="stat-value">{stats.completedTasks}</div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat-card in-progress">
              <div className="stat-value">{stats.inProgressTasks}</div>
              <div className="stat-label">In Progress</div>
            </div>
            <div className="stat-card velocity">
              <div className="stat-value">{stats.velocity}</div>
              <div className="stat-label">Avg Velocity</div>
            </div>
            <div className="stat-card completion">
              <div className="stat-value">
                {stats.totalTasks > 0
                  ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
                  : 0}%
              </div>
              <div className="stat-label">Completion Rate</div>
            </div>
          </div>

          <div className="charts-section">
            <VelocityChart sprints={sprints} />
            <BurndownChart burndown={stats.burndown} />
          </div>
        </>
      )}

      {!selectedProjectId && !loading && (
        <div className="no-project">
          <p>Select a project to view analytics.</p>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;

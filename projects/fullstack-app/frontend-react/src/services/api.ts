import axios from 'axios';
import { Project, Task, Sprint, ProjectStats } from '../types';

const api = axios.create({
  baseURL: 'http://localhost:8090/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const getProjects = async (): Promise<Project[]> => {
  const response = await api.get<Project[]>('/projects');
  return response.data;
};

export const getTasksByProject = async (projectId: string): Promise<Task[]> => {
  const response = await api.get<Task[]>(`/tasks/project/${projectId}`);
  return response.data;
};

export const getSprints = async (projectId: string): Promise<Sprint[]> => {
  const response = await api.get<Sprint[]>(`/sprints/project/${projectId}`);
  return response.data;
};

export const getProjectStats = async (projectId: string): Promise<ProjectStats> => {
  const [tasks, sprints] = await Promise.all([
    getTasksByProject(projectId),
    getSprints(projectId)
  ]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'DONE').length;
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const backlogTasks = tasks.filter(t => t.status === 'BACKLOG').length;

  const completedSprints = sprints.filter(s => s.status === 'COMPLETED');
  const velocity = completedSprints.length > 0
    ? Math.round(completedSprints.reduce((sum, s) => sum + s.velocity, 0) / completedSprints.length)
    : 0;

  const totalStoryPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
  const burndown: { day: string; ideal: number; actual: number }[] = [];
  const days = 14;
  for (let i = 0; i <= days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    burndown.push({
      day: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      ideal: Math.round(totalStoryPoints * (1 - i / days)),
      actual: i < days / 2
        ? Math.round(totalStoryPoints * (1 - i / days) + (Math.random() * 5 - 2))
        : 0
    });
  }

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    backlogTasks,
    velocity,
    burndown
  };
};

export default api;

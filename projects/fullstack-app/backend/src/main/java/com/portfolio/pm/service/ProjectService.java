package com.portfolio.pm.service;

import com.portfolio.pm.model.dto.ProjectRequest;
import com.portfolio.pm.model.dto.ProjectResponse;

import java.util.List;
import java.util.UUID;

public interface ProjectService {

    List<ProjectResponse> getAllProjects();

    ProjectResponse getProjectById(UUID id);

    ProjectResponse createProject(ProjectRequest request);

    ProjectResponse updateProject(UUID id, ProjectRequest request);

    void deleteProject(UUID id);
}

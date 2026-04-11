package com.portfolio.pm.service;

import com.portfolio.pm.exception.ResourceNotFoundException;
import com.portfolio.pm.model.Project;
import com.portfolio.pm.model.Project.ProjectStatus;
import com.portfolio.pm.model.dto.ProjectRequest;
import com.portfolio.pm.model.dto.ProjectResponse;
import com.portfolio.pm.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;

    @Override
    public List<ProjectResponse> getAllProjects() {
        log.debug("Fetching all projects");
        return projectRepository.findAll().stream()
                .map(ProjectResponse::from)
                .toList();
    }

    @Override
    public ProjectResponse getProjectById(UUID id) {
        log.debug("Fetching project by id: {}", id);
        return ProjectResponse.from(findOrThrow(id));
    }

    @Override
    @Transactional
    public ProjectResponse createProject(ProjectRequest request) {
        log.info("Creating project: {}", request.name());
        Project project = Project.builder()
                .name(request.name())
                .description(request.description())
                .owner(request.owner())
                .status(request.status() != null ? request.status() : ProjectStatus.PLANNING)
                .build();
        Project saved = projectRepository.save(project);
        log.info("Project created with id: {}", saved.getId());
        return ProjectResponse.from(saved);
    }

    @Override
    @Transactional
    public ProjectResponse updateProject(UUID id, ProjectRequest request) {
        log.info("Updating project: {}", id);
        Project project = findOrThrow(id);
        project.setName(request.name());
        project.setDescription(request.description());
        project.setOwner(request.owner());
        if (request.status() != null) {
            project.setStatus(request.status());
        }
        return ProjectResponse.from(projectRepository.save(project));
    }

    @Override
    @Transactional
    public void deleteProject(UUID id) {
        log.info("Deleting project: {}", id);
        if (!projectRepository.existsById(id)) {
            throw new ResourceNotFoundException("Project not found with id: " + id);
        }
        projectRepository.deleteById(id);
    }

    private Project findOrThrow(UUID id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
    }
}

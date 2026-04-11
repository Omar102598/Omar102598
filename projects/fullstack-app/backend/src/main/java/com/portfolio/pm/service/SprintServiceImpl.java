package com.portfolio.pm.service;

import com.portfolio.pm.exception.ResourceNotFoundException;
import com.portfolio.pm.model.Sprint;
import com.portfolio.pm.model.Sprint.SprintStatus;
import com.portfolio.pm.model.dto.SprintRequest;
import com.portfolio.pm.model.dto.SprintResponse;
import com.portfolio.pm.repository.SprintRepository;
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
public class SprintServiceImpl implements SprintService {

    private final SprintRepository sprintRepository;

    @Override
    public List<SprintResponse> getSprintsByProject(UUID projectId) {
        log.debug("Fetching sprints for project: {}", projectId);
        return sprintRepository.findByProjectId(projectId).stream()
                .map(SprintResponse::from)
                .toList();
    }

    @Override
    public SprintResponse getSprintById(UUID id) {
        log.debug("Fetching sprint by id: {}", id);
        return SprintResponse.from(findOrThrow(id));
    }

    @Override
    @Transactional
    public SprintResponse createSprint(SprintRequest request) {
        log.info("Creating sprint: {} for project: {}", request.name(), request.projectId());
        Sprint sprint = Sprint.builder()
                .projectId(request.projectId())
                .name(request.name())
                .goal(request.goal())
                .startDate(request.startDate())
                .endDate(request.endDate())
                .velocity(request.velocity())
                .build();
        Sprint saved = sprintRepository.save(sprint);
        log.info("Sprint created with id: {}", saved.getId());
        return SprintResponse.from(saved);
    }

    @Override
    @Transactional
    public SprintResponse updateSprint(UUID id, SprintRequest request) {
        log.info("Updating sprint: {}", id);
        Sprint sprint = findOrThrow(id);
        sprint.setName(request.name());
        sprint.setGoal(request.goal());
        sprint.setStartDate(request.startDate());
        sprint.setEndDate(request.endDate());
        sprint.setVelocity(request.velocity());
        return SprintResponse.from(sprintRepository.save(sprint));
    }

    @Override
    @Transactional
    public SprintResponse activateSprint(UUID id) {
        log.info("Activating sprint: {}", id);
        Sprint sprint = findOrThrow(id);
        sprint.setStatus(SprintStatus.ACTIVE);
        return SprintResponse.from(sprintRepository.save(sprint));
    }

    @Override
    @Transactional
    public SprintResponse completeSprint(UUID id) {
        log.info("Completing sprint: {}", id);
        Sprint sprint = findOrThrow(id);
        sprint.setStatus(SprintStatus.COMPLETED);
        return SprintResponse.from(sprintRepository.save(sprint));
    }

    @Override
    @Transactional
    public void deleteSprint(UUID id) {
        log.info("Deleting sprint: {}", id);
        if (!sprintRepository.existsById(id)) {
            throw new ResourceNotFoundException("Sprint not found with id: " + id);
        }
        sprintRepository.deleteById(id);
    }

    private Sprint findOrThrow(UUID id) {
        return sprintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint not found with id: " + id));
    }
}

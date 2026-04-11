package com.portfolio.pm.service;

import com.portfolio.pm.model.dto.SprintRequest;
import com.portfolio.pm.model.dto.SprintResponse;

import java.util.List;
import java.util.UUID;

public interface SprintService {

    List<SprintResponse> getSprintsByProject(UUID projectId);

    SprintResponse getSprintById(UUID id);

    SprintResponse createSprint(SprintRequest request);

    SprintResponse updateSprint(UUID id, SprintRequest request);

    SprintResponse activateSprint(UUID id);

    SprintResponse completeSprint(UUID id);

    void deleteSprint(UUID id);
}

package interconnections.service.impl;

import interconnections.model.MonthSchedule;
import interconnections.service.SchedulesService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Service
public class SchedulesServiceImpl implements SchedulesService {

    private static final Logger log = LoggerFactory.getLogger(SchedulesServiceImpl.class);

    private RestTemplate restTemplate;

    public SchedulesServiceImpl(final RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public MonthSchedule getSchedules(
            final String origin,
            final String destination,
            final int year,
            final int month)
            throws RestClientException {

        final String URL = String.format("https://api.ryanair.com/timetable/3/schedules/%s/%s/years/%d/months/%d",
                origin, destination, year, month);

        log.debug(String.format("API CALL %s", URL));

        return restTemplate.getForObject(URL, MonthSchedule.class);
    }

}

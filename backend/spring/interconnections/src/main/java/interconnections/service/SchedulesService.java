package interconnections.service;

import interconnections.model.MonthSchedule;
import org.springframework.web.client.RestClientException;

public interface SchedulesService {

    /**
     * returns a list of available flights for a given departure airport IATA code, an arrival airport
     * IATA code, a year and a month.
     * @param origin
     * @param destination
     * @param year
     * @param month
     * @return
     * @throws RestClientException
     */
    MonthSchedule getSchedules(String origin, String destination, int year, int month) throws RestClientException;
}

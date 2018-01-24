package interconnections.service;

import interconnections.model.Interconnection;
import org.springframework.web.client.RestClientException;

import java.time.LocalDateTime;
import java.util.List;

public interface InterconnectionsService {

    /**
     * Max time interval allowed between earliestDeparture and latestArrival
     */
    int MAX_TIME_INTERVAL = 30;

    /**
     * Returns a list of flights departing from <code>departure</code> airport not earlier
     * than <code>earliestDeparture</code> and arriving to <code>arrival</code> airport not later
     * than <code>latestArrival</code>.
     * <p>
     * The list consists of:
     * - All direct flights if available (for example: DUB - WRO)
     * - All interconnected flights with a maximum of one stop if available (for example: DUB - STN - WRO
     * <p>
     * For interconnected flights the difference between the arrival and the next departure should be 2h
     * or greater.
     *
     * The time span between earliestDeparture and latestArrival is limited to <code>MAX_TIME_INTERVAL</code>
     * for performance reasons.
     *
     * @param departure         departure airport IATA code
     * @param arrival           arrival airport IATA code
     * @param earliestDeparture earliest departure date
     * @param latestArrival     latest arrival date
     * @return list of interconnections.
     */
    List<Interconnection> getInterconnections(String departure, String arrival, LocalDateTime earliestDeparture,
            LocalDateTime latestArrival) throws RestClientException;

}

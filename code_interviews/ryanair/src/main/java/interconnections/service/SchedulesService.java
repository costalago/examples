package interconnections.service;

import interconnections.model.Leg;

import javax.annotation.Nonnull;
import java.time.ZonedDateTime;
import java.util.List;

public interface SchedulesService {

    /**
     * Finds available flight legs between the origin and destination
     * airports and inside the time window specified by earliestDate
     * and latestDate
     *
     * @param origin origin airport
     * @param destination destination airport
     * @param earliestDate start of time window
     * @param latestDate end of time window
     * @return legs found between origin and destination airport and within the time window
     */
    List<Leg> getLegs(
            @Nonnull String origin,
            @Nonnull String destination,
            @Nonnull ZonedDateTime earliestDate,
            @Nonnull ZonedDateTime latestDate);

}

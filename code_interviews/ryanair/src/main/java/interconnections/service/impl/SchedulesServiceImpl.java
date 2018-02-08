package interconnections.service.impl;

import com.google.common.base.Preconditions;
import interconnections.model.DaySchedule;
import interconnections.model.Flight;
import interconnections.model.Leg;
import interconnections.model.MonthSchedule;
import interconnections.service.SchedulesService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import javax.annotation.Nonnull;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;

@Service
public class SchedulesServiceImpl implements SchedulesService {

    private static final Logger log = LoggerFactory.getLogger(SchedulesServiceImpl.class);

    private RestTemplate restTemplate;

    public SchedulesServiceImpl(final RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Finds several MonthSchedule montly flight schedules between earliestDate
     * and latestDate. After that creates a Leg object for each Flight objects, some
     * of them fall outside the given time window and are discarded.
     *
     * @param origin
     * @param destination
     * @param earliestDate
     * @param latestDate
     * @return
     */
    @Override
    public List<Leg> getLegs(
            @Nonnull final String origin,
            @Nonnull final String destination,
            @Nonnull ZonedDateTime earliestDate,
            @Nonnull ZonedDateTime latestDate) {

        Preconditions.checkNotNull(origin);
        Preconditions.checkNotNull(destination);
        Preconditions.checkNotNull(earliestDate);
        Preconditions.checkNotNull(latestDate);

        List<Leg> result = new ArrayList<>();

        LocalDate iDate = earliestDate.toLocalDate();
        LocalDate endDate = latestDate.plusMonths(1).with(TemporalAdjusters.firstDayOfMonth()).toLocalDate();

        while (iDate.isBefore(endDate)) {

            MonthSchedule schedule = getSchedule(origin, destination, iDate.getYear(), iDate.getMonthValue());

            for (DaySchedule daySchedule : schedule.getDays()) {
                for (Flight flight : daySchedule.getFlights()) {

                    // Create leg from flight, origin and destination airports and date
                    // The arrival date is adjusted taking into account that a flight can land
                    // on the next or the previous day to the arrival date
                    Leg leg = Leg.fromFlight(flight, origin, destination,
                            LocalDate.of(iDate.getYear(), schedule.getMonth(), daySchedule.getDay()));

                    // Only add legs that fall into the time window, discard the rest
                    if ((leg.getDepartureDateTime().isAfter(earliestDate) ||
                            leg.getDepartureDateTime().isEqual(earliestDate)) &&
                            (leg.getArrivalDateTime().isBefore(latestDate) ||
                                    leg.getArrivalDateTime().isEqual(latestDate))) {
                        result.add(leg);
                    }
                }
            }

            iDate = iDate.plusMonths(1);
        }

        return result;
    }

    /**
     * Wrapper for the ryanair shedule service
     *
     * @param origin
     * @param destination
     * @param year
     * @param month
     * @return
     * @throws RestClientException
     */
    private MonthSchedule getSchedule(
            @Nonnull final String origin,
            @Nonnull final String destination,
            final int year,
            final int month)
            throws RestClientException {

        Preconditions.checkNotNull(origin);
        Preconditions.checkNotNull(destination);

        final String URL = String.format("https://api.ryanair.com/timetable/3/schedules/%s/%s/years/%d/months/%d",
                origin, destination, year, month);

        log.debug(String.format("API CALL %s", URL));

        return restTemplate.getForObject(URL, MonthSchedule.class);
    }

}

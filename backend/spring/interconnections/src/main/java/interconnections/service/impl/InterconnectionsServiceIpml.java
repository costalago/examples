package interconnections.service.impl;

import com.google.common.base.Preconditions;
import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.google.common.graph.GraphBuilder;
import com.google.common.graph.ImmutableGraph;
import com.google.common.graph.MutableGraph;
import interconnections.graph.GraphUtils;
import interconnections.model.*;
import interconnections.service.InterconnectionsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;

@Service
public class InterconnectionsServiceIpml implements InterconnectionsService {

    private static final Logger log = LoggerFactory.getLogger(InterconnectionsServiceIpml.class);

    private RoutesServiceImpl routesService;
    private SchedulesServiceImpl schedulesService;

    // Routes are cached for 10 min
    Cache<Integer, List<Route>> routeCache = CacheBuilder.newBuilder()
            .maximumSize(1)
            .expireAfterWrite(10, TimeUnit.MINUTES)
            .build();

    // up to 1000 Schedules are cached for up to 5 min
    public static final int MAX_CACHED_MONTH_SCHEDULES = 1000;
    Cache<String, MonthSchedule> scheduleCache = CacheBuilder.newBuilder()
            .maximumSize(MAX_CACHED_MONTH_SCHEDULES)
            .expireAfterWrite(5, TimeUnit.MINUTES)
            .build();

    public InterconnectionsServiceIpml(RoutesServiceImpl routesService, SchedulesServiceImpl schedulesService) {
        this.routesService = routesService;
        this.schedulesService = schedulesService;
    }

    /**
     * Converts a MonthSchedule object to a list of Leg objects
     *
     * @param origin
     * @param destination
     * @param year
     * @param month
     * @param schedule
     * @return
     */
    private List<Leg> scheduleToLegs(
            final String origin,
            final String destination,
            final int year,
            final int month,
            final MonthSchedule schedule) {

        final List<Leg> legs = new ArrayList<>();

        for (DaySchedule daySchedule : schedule.getDays()) {

            final int day = daySchedule.getDay();
            for (Flight flight : daySchedule.getFlights()) {

                final Leg leg = new Leg(
                        origin,
                        destination,
                        LocalDateTime.of(
                                LocalDate.of(year, month, day),
                                LocalTime.parse(
                                        flight.getDepartureTime(), DateTimeFormatter.ofPattern("HH:mm"))),
                        LocalDateTime.of(
                                LocalDate.of(year, month, day),
                                LocalTime.parse(
                                        flight.getArrivalTime(), DateTimeFormatter.ofPattern("HH:mm")))
                );

                legs.add(leg);
            }
        }

        return legs;
    }

    /**
     * Retrieves flight legs on the months specified by the time interval given by
     * earliestDeparture and latestArrival.
     * <p>
     * Since we retrieve full months at once some legs will fall outside the time interval.
     *
     * @param origin
     * @param destination
     * @param earliestDeparture
     * @param latestArrival
     * @return
     * @throws RestClientException
     */
    private List<Leg> getLegs(
            final String origin,
            final String destination,
            final LocalDateTime earliestDeparture,
            final LocalDateTime latestArrival)
            throws RestClientException {

        final List<Leg> result = new ArrayList<>();

        final int firstYear = earliestDeparture.getYear();
        final int firstMonth = earliestDeparture.getMonthValue();
        final int lastYear = latestArrival.getYear();
        final int lastMonth = latestArrival.getMonthValue();

        for (int year = firstYear; year <= lastYear; year++) {

            final int startMonth = year == firstYear ? firstMonth : 1;
            final int endMonth = year == lastYear ? lastMonth : 12;

            for (int month = startMonth; month <= endMonth; month++) {

                final int finalYear = year;
                final int finalMonth = month;
                MonthSchedule schedule;
                try {
                    schedule = scheduleCache.get(origin + destination + year + month,
                            () -> schedulesService.getSchedules(origin, destination, finalYear, finalMonth));
                } catch (ExecutionException e) {
                    log.debug(e.getMessage(), e);
                    schedule = schedulesService.getSchedules(origin, destination, finalYear, finalMonth);
                }

                result.addAll(scheduleToLegs(origin, destination, year, month, schedule));
            }
        }

        return result;
    }

    /**
     * Given a an airport path, for example DUB - STN - WRO and a range of dates finds all
     * viable interconnections for those dates.
     *
     * @param path
     * @param earliestDeparture
     * @param latestArrival
     * @return
     * @throws RestClientException
     */
    private List<Interconnection> getInterconnectionsForPath(
            List<String> path,
            LocalDateTime earliestDeparture,
            LocalDateTime latestArrival)
            throws RestClientException {

        // First we will find all the legs or edges of the path (internally it calls the schedule service).
        // After this we will remove every leg that falls outside the time interval given
        // by earliestDeparture and latestArrival.
        List<List<Leg>> legLists = new ArrayList<>();
        for (int i = 0; i < path.size() - 1; i++) {

            List<Leg> legs = getLegs(path.get(i), path.get(i + 1), earliestDeparture, latestArrival);

            legs.removeIf(next -> next.getDepartureDateTime().isBefore(earliestDeparture) ||
                    next.getArrivalDateTime().isAfter(latestArrival));

            legLists.add(legs);
        }

        // Now all the Leg objects are converted to Interconnection objects
        List<Interconnection> interconnections = new ArrayList<>();

        // TODO: generalize to path.size() == N
        if (path.size() == 2) {

            // Paths like DUB - WRO only have no stops and one leg.
            for (Leg leg : legLists.get(0)) {
                Interconnection interconnection = new Interconnection();
                interconnection.setStops(0);
                interconnection.setLegs(Collections.singletonList(leg));
                interconnections.add(interconnection);
            }

        } else if (path.size() == 3) {

            // Paths like DUB - STN - WRO have one stop and two legs
            for (Leg leg : legLists.get(0)) {
                for (Leg nextLeg : legLists.get(1)) {

                    // Only flights / legs with at least two hours in between them can be joined together
                    // in an interconnection.
                    if (leg.getArrivalDateTime().until(nextLeg.getDepartureDateTime(), ChronoUnit.HOURS) >= 2) {
                        Interconnection interconnection = new Interconnection();
                        interconnection.setStops(1);
                        interconnection.setLegs(Arrays.asList(leg, nextLeg));
                        interconnections.add(interconnection);
                    }
                }
            }
        }

        return interconnections;
    }

    /**
     * Creates a Guava graph with the provided routes and then
     * finds all the paths of length 2 or shorter.
     *
     * @param routes    List of available routes.
     * @param departure origin airport.
     * @param arrival   destination airport.
     * @return List of paths found.
     */
    private List<List<String>> findPathsFromRoutes(
            final List<Route> routes,
            final String departure,
            final String arrival) {

        final MutableGraph<String> routeGraph = GraphBuilder.directed().build();
        for (Route route : routes) {
            if (route.getConnectingAirport() == null) {
                routeGraph.putEdge(route.getAirportFrom(), route.getAirportTo());
            }
        }

        return GraphUtils.findPathsDepthLimited(
                ImmutableGraph.copyOf(routeGraph), departure, arrival, 2);
    }

    @Override
    public List<Interconnection> getInterconnections(
            final String departure,
            final String arrival,
            final LocalDateTime earliestDeparture,
            final LocalDateTime latestArrival) throws RestClientException {

        Preconditions.checkNotNull(departure);
        Preconditions.checkNotNull(arrival);
        Preconditions.checkNotNull(earliestDeparture);
        Preconditions.checkNotNull(latestArrival);
        Preconditions.checkArgument(departure.matches("[A-Z]{3}"), "Bad departure format.");
        Preconditions.checkArgument(arrival.matches("[A-Z]{3}"), "Bad arrival format.");
        Preconditions.checkArgument(earliestDeparture.isBefore(latestArrival), "Arrival date is before Departure date.");
        Preconditions.checkArgument(
                earliestDeparture.until(latestArrival, ChronoUnit.DAYS) < MAX_TIME_INTERVAL,
                String.format("departure and arrival interval is bigger than %d days.", MAX_TIME_INTERVAL));

        log.info("Finding all available routes...");

        // Routes are cached for 10 min
        List<Route> routes;
        try {
            routes = routeCache.get(1, () -> routesService.getRoutes());
        } catch (ExecutionException e) {
            log.debug(e.getMessage(), e);
            routes = routesService.getRoutes();
        }

        log.info("Finding paths connecting DUB and WRO in route graph...");
        List<List<String>> paths = findPathsFromRoutes(routes, departure, arrival);
        log.info(String.format("%d Paths found connecting DUB WRO in route graph:", paths.size()));

        List<Interconnection> allInterconnections = new ArrayList<>();

        for (List<String> path : paths) {

            log.debug(String.format("Finding available flight interconnections for path: %s", path.toString()));

            try {

                final List<Interconnection> interconnections = getInterconnectionsForPath(
                        path, earliestDeparture, latestArrival);

                log.info(String.format("Found %d flight interconnections for path: %s",
                        interconnections.size(), path.toString()));

                allInterconnections.addAll(interconnections);

            } catch (Exception e) {
                log.error(String.format("Failed processing path %s", path));
                log.debug(String.format("Failed processing path %s", path), e);
            }

        }

        log.info(String.format("Found %d valid interconnections between DUB and WRO.", allInterconnections.size()));

        return allInterconnections;
    }

}

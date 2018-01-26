package interconnections.service.impl;

import com.google.common.base.Preconditions;
import commons.JavaUtils;
import interconnections.model.Interconnection;
import interconnections.model.Leg;
import interconnections.service.InterconnectionsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;

import javax.annotation.Nonnull;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletionService;
import java.util.concurrent.ExecutorCompletionService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

@Service
public class InterconnectionsServiceIpml implements InterconnectionsService {

    private static final Logger log = LoggerFactory.getLogger(InterconnectionsServiceIpml.class);

    private final RoutesServiceImpl routesService;
    private final SchedulesServiceImpl schedulesService;

    private final CompletionService<List<Interconnection>> completionService = new ExecutorCompletionService<>(
            Executors.newFixedThreadPool(COMPLETION_SERVICE_THREAD_POOL_SIZE));
    // TODO: inject this?
    private static final int COMPLETION_SERVICE_THREAD_POOL_SIZE = 20;

    public InterconnectionsServiceIpml(RoutesServiceImpl routesService, SchedulesServiceImpl schedulesService) {
        this.routesService = routesService;
        this.schedulesService = schedulesService;
    }

    @Override
    public List<Interconnection> getInterconnections(
            @Nonnull final String departure,
            @Nonnull final String arrival,
            @Nonnull final ZonedDateTime earliestDeparture,
            @Nonnull final ZonedDateTime latestArrival) throws RestClientException {

        return getInterconnections(departure, arrival, earliestDeparture, latestArrival, 0, 1);
    }

    @Override
    public List<Interconnection> getInterconnections(
            @Nonnull final String departure,
            @Nonnull final String arrival,
            @Nonnull final ZonedDateTime earliestDeparture,
            @Nonnull final ZonedDateTime latestArrival,
            int minStops,
            int maxStops) throws RestClientException {

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
        Preconditions.checkArgument(minStops >= 0 && minStops <= maxStops);

        log.info(String.format("Finding paths connecting %s and %s in route graph...", departure, arrival));
        List<List<String>> paths = routesService.getPaths(departure, arrival, minStops + 1, maxStops + 1);

        log.info(String.format("%d Paths found connecting %s %s in route graph:", paths.size(), departure, arrival));

        log.info("Processing paths...");
        List<Future<List<Interconnection>>> tasks = new ArrayList<>();

        for (final List<String> path : paths) {

            // Process each path asynchronously using the thread pool
            tasks.add(completionService.submit(() -> {

                List<Interconnection> interconnections = new ArrayList<>();

                // Get legs for each part of the path
                List<List<Leg>> legLists = new ArrayList<>();
                for (int i = 0; i < path.size() - 1; i++) {
                    String legDeparture = path.get(i);
                    String legArrival = path.get(i + 1);

                    try {

                        legLists.add(schedulesService.getLegs(
                                legDeparture, legArrival, earliestDeparture, latestArrival));

                    } catch (RestClientException e) {
                        log.warn(String.format("Couldn't retrieve legs for route %s->%s : %s",
                                legDeparture, legArrival, e.getMessage()));
                        log.debug(e.getMessage(), e);
                    }

                }

                // Get all ordered Leg combinations and convert them to Interconnection objects
                for (List<Leg> legCombination : JavaUtils.getOrderedCombinations(legLists)) {
                    int stops = path.size() - 2;

                    Interconnection inter = new Interconnection(stops, legCombination);

                    if (inter.valid()) {
                        interconnections.add(inter);
                    } else {
                        log.debug(String.format("Invalid interconnection discarded %s", inter));
                    }
                }

                log.info(String.format("Checked path %s, found %d interconnections.", path, interconnections.size()));

                return interconnections;
            }));

        }

        // Wait for all tasks to complete, ignore the calls that didn't work
        List<Interconnection> result = new ArrayList<>();
        int received = 0;

        while (received < tasks.size()) {

            try {

                Future<List<Interconnection>> resultFuture = completionService.take();
                result.addAll(resultFuture.get());
                received++;

            } catch (Exception e) {
                log.error(e.getMessage());
                log.debug(e.getMessage(), e);
            }

        }

        log.info(String.format("Found %d valid interconnections between DUB and WRO.", result.size()));

        return result;
    }

}

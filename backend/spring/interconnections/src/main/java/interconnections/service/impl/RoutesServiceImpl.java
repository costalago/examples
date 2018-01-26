package interconnections.service.impl;

import com.google.common.graph.GraphBuilder;
import com.google.common.graph.ImmutableGraph;
import com.google.common.graph.MutableGraph;
import commons.GraphUtils;
import interconnections.model.Route;
import interconnections.service.RoutesService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import javax.annotation.Nonnull;
import java.util.List;

/**
 * This service gets the airport routes every <code>UPDATE_INTERVAL_MS</code> milliseconds
 * and then builds a graph with them.
 * <p>
 * A getPaths method is provided to find paths in the graph.
 */
@Service
public class RoutesServiceImpl implements RoutesService {

    private static final Logger log = LoggerFactory.getLogger(RoutesServiceImpl.class);

    public static final int UPDATE_INTERVAL_MS = 1000 * 60 * 5;

    private MutableGraph<String> routeGraph;
    private RestTemplate restTemplate;

    public RoutesServiceImpl(RestTemplate restTemplate) {
        routeGraph = GraphBuilder.directed().build();
        this.restTemplate = restTemplate;

        updateGraph();
    }

    protected List<Route> getRoutes()
            throws RestClientException {

        final String URL = "https://api.ryanair.com/core/3/routes";

        log.debug(String.format("API CALL %s", URL));

        ResponseEntity<List<Route>> rateResponse =
                restTemplate.exchange(URL, HttpMethod.GET, null,
                        new ParameterizedTypeReference<List<Route>>() {
                        });

        return rateResponse.getBody();
    }

    /**
     * Update the graph every 5 minutes
     */
    @Scheduled(initialDelay = UPDATE_INTERVAL_MS, fixedDelay = UPDATE_INTERVAL_MS)
    private void updateGraph() {
        log.info("Updating routes graph...");

        List<Route> routes = getRoutes();

        for (Route route : routes) {
            if (route.getConnectingAirport() == null) {
                routeGraph.putEdge(route.getAirportFrom(), route.getAirportTo());
            }
        }
    }

    @Override
    public List<List<String>> getPaths(
            @Nonnull String departure,
            @Nonnull String arrival,
            int minPathLength,
            int maxPathLenght) {
        return GraphUtils.findPathsDepthLimited(
                ImmutableGraph.copyOf(routeGraph), departure, arrival, minPathLength, maxPathLenght);
    }


}

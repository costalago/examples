package interconnections.service;

import interconnections.model.Route;
import org.springframework.web.client.RestClientException;

import java.util.List;

public interface RoutesService {

    /**
     * Returns a list of all available routes based on the airport's IATA codes.
     * @return
     * @throws RestClientException
     */
    List<Route> getRoutes() throws RestClientException;
}

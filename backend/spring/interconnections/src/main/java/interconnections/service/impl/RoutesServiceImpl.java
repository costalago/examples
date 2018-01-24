package interconnections.service.impl;

import interconnections.model.Route;
import interconnections.service.RoutesService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class RoutesServiceImpl implements RoutesService {

    private static final Logger log = LoggerFactory.getLogger(RoutesServiceImpl.class);

    private RestTemplate restTemplate;

    public RoutesServiceImpl(final RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public List<Route> getRoutes()
            throws RestClientException {

        final String URL = "https://api.ryanair.com/core/3/routes";

        log.debug(String.format("API CALL %s", URL));

        ResponseEntity<List<Route>> rateResponse =
                restTemplate.exchange(URL, HttpMethod.GET, null,
                        new ParameterizedTypeReference<List<Route>>() {
                        });

        return rateResponse.getBody();
    }

}

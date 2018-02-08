package interconnections.controller.impl;

import interconnections.commons.TimeUtils;
import interconnections.controller.InterconnectionsController;
import interconnections.model.Interconnection;
import interconnections.service.InterconnectionsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.List;

@RestController
public class InterconnectionsControllerImpl implements InterconnectionsController {

    private static final Logger log = LoggerFactory.getLogger(InterconnectionsControllerImpl.class);

    private InterconnectionsService interconnectionsService;

    public InterconnectionsControllerImpl(InterconnectionsService interconnectionsService) {
        this.interconnectionsService = interconnectionsService;
    }

    @Override
    @RequestMapping("/interconnections")
    public List<Interconnection> interconnections(
            @RequestParam(value = "departure") String departure,
            @RequestParam(value = "arrival") String arrival,
            @RequestParam(value = "departureDateTime") String departureDateTime,
            @RequestParam(value = "arrivalDateTime") String arrivalDateTime) {

        ZonedDateTime departureDateObj;
        ZonedDateTime arrivalDateObj;
        try {
            departureDateObj = ZonedDateTime.of(
                    LocalDateTime.parse(departureDateTime), TimeUtils.zoneFromAirport(departure));
            arrivalDateObj = ZonedDateTime.of(
                    LocalDateTime.parse(arrivalDateTime),
                    TimeUtils.zoneFromAirport(arrival));
        } catch (Exception e) {
            throw new IllegalArgumentException(e);
        }

        return interconnectionsService.getInterconnections(
                departure, arrival, departureDateObj, arrivalDateObj);
    }


}

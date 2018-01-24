package interconnections.controller.impl;

import com.google.common.base.Preconditions;
import interconnections.controller.InterconnectionsController;
import interconnections.model.Interconnection;
import interconnections.service.InterconnectionsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
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

        LocalDateTime departureDateObj;
        LocalDateTime arrivalDateObj;
        try {
            departureDateObj = LocalDateTime.parse(departureDateTime);
            arrivalDateObj = LocalDateTime.parse(arrivalDateTime);
        } catch (Exception e) {
            throw new IllegalArgumentException(e);
        }

        return interconnectionsService.getInterconnections(
                departure, arrival, departureDateObj, arrivalDateObj);
    }


}

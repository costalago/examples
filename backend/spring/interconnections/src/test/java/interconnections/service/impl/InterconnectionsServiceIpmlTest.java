package interconnections.service.impl;

import interconnections.model.Interconnection;
import interconnections.model.Leg;
import interconnections.service.InterconnectionsService;
import interconnections.service.SchedulesService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.junit.Assert.*;

@RunWith(SpringRunner.class)
@SpringBootTest
public class InterconnectionsServiceIpmlTest {

    @Autowired
    InterconnectionsService interconnectionsService;

    private boolean legDatesCorrect(Leg leg, LocalDateTime start, LocalDateTime end) {

        LocalDateTime departure = leg.getDepartureDateTime();
        LocalDateTime arrival = leg.getArrivalDateTime();

        return departure.isAfter(arrival) &&
                departure.isEqual(start) || departure.isAfter(start) &&
                arrival.isBefore(end) || arrival.isEqual(end);

    }

    @Test
    public void getInterconnections() throws Exception {

        LocalDateTime earliestDate = LocalDateTime.parse("2018-03-01T07:00");
        LocalDateTime latestDate = LocalDateTime.parse("2018-03-03T21:00");

        List<Interconnection> interconnections = interconnectionsService.getInterconnections(
                "DUB", "WRO", earliestDate, latestDate);

        for (Interconnection interconnection : interconnections) {
            if(interconnection.getStops() == 0) {
                assertTrue(interconnection.getLegs().size() == 1);

                // Test that the arrival and departure dates are within the correct interval
                Leg leg = interconnection.getLegs().get(0);
                assertTrue(legDatesCorrect(leg, earliestDate, latestDate));

            } else if(interconnection.getStops() == 1) {

                assertTrue(interconnection.getLegs().size() == 2);

                // Test that the arrival and departure dates are within the correct interval
                Leg leg0 = interconnection.getLegs().get(0);
                assertTrue(legDatesCorrect(leg0, earliestDate, latestDate));

                Leg leg1 = interconnection.getLegs().get(1);
                assertTrue(legDatesCorrect(leg1, earliestDate, latestDate));

                // Test that we have 2 hours between arrival from leg0 and departure from leg1
                assertTrue(
                        leg0.getArrivalDateTime().until(leg1.getDepartureDateTime(), ChronoUnit.HOURS) >= 2);
            }
        }
    }
}
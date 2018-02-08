package interconnections.model;

import interconnections.commons.TimeUtils;
import org.junit.Test;

import java.time.*;

import static org.junit.Assert.assertTrue;

public class LegTest {

    @Test
    public void fromFlight() {

        LocalDate date = LocalDate.of(2008, 1, 25);

        ZoneId MADzone = TimeUtils.zoneFromAirport("MAD");
        ZoneId DUBzone = TimeUtils.zoneFromAirport("DUB");
        ZoneId BERzone = TimeUtils.zoneFromAirport("BER");

        // Arrival on previous day on destination timezone (to a smaller timezone)
        Flight flight = new Flight();
        flight.setDepartureTime("00:20");
        flight.setArrivalTime("23:50");
        Leg leg = Leg.fromFlight(flight, "MAD", "DUB", date);

        assertTrue(leg.getArrivalDateTime().equals(
                ZonedDateTime.of(date.minusDays(1), LocalTime.of(23, 50), DUBzone)));
        assertTrue(leg.getDepartureDateTime().equals(
                ZonedDateTime.of(date, LocalTime.of(0, 20), MADzone)));

        // Arrival next day on destination timezone (to a smaller timezone)
        flight = new Flight();
        flight.setDepartureTime("22:50");
        flight.setArrivalTime("00:20");
        leg = Leg.fromFlight(flight, "MAD", "DUB", date);

        assertTrue(leg.getArrivalDateTime().equals(
                ZonedDateTime.of(date.plusDays(1), LocalTime.of(0, 20), DUBzone)));
        assertTrue(leg.getDepartureDateTime().equals(
                ZonedDateTime.of(date, LocalTime.of(22, 50), MADzone)));

        // Arrival next day on destination timezone (to a bigger timezone)
        flight = new Flight();
        flight.setDepartureTime("22:50");
        flight.setArrivalTime("00:20");
        leg = Leg.fromFlight(flight, "MAD", "BER", date);

        assertTrue(leg.getArrivalDateTime().equals(
                ZonedDateTime.of(date.plusDays(1), LocalTime.of(0, 20), BERzone)));
        assertTrue(leg.getDepartureDateTime().equals(
                ZonedDateTime.of(date, LocalTime.of(22, 50), MADzone)));

        // Arrival on same day
        flight = new Flight();
        flight.setDepartureTime("00:20");
        flight.setArrivalTime("23:00");
        leg = Leg.fromFlight(flight, "MAD", "BER", date);

        assertTrue(leg.getArrivalDateTime().equals(
                ZonedDateTime.of(date, LocalTime.of(23, 0), BERzone)));
        assertTrue(leg.getDepartureDateTime().equals(
                ZonedDateTime.of(date, LocalTime.of(0, 20), MADzone)));

        // Arrival on previous year
        flight = new Flight();
        flight.setDepartureTime("00:20");
        flight.setArrivalTime("23:50");
        leg = Leg.fromFlight(flight, "MAD", "DUB", LocalDate.of(2018, 1, 1));

        assertTrue(leg.getArrivalDateTime().equals(
                ZonedDateTime.of(LocalDate.of(2017, 12, 31), LocalTime.of(23, 50), DUBzone)));
        assertTrue(leg.getDepartureDateTime().equals(
                ZonedDateTime.of(LocalDate.of(2018, 1, 1), LocalTime.of(0, 20), MADzone)));
    }
}
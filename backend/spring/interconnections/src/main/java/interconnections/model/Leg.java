package interconnections.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import interconnections.commons.TimeUtils;

import java.time.*;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Leg {

    private String departureAirport;
    private String arrivalAirport;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "uuuu-MM-dd'T'HH:mm")
    private ZonedDateTime departureDateTime;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "uuuu-MM-dd'T'HH:mm")
    private ZonedDateTime arrivalDateTime;

    public Leg(String departureAirport, String arrivalAirport, ZonedDateTime departureDateTime, ZonedDateTime arrivalDateTime) {
        this.departureAirport = departureAirport;
        this.arrivalAirport = arrivalAirport;
        this.departureDateTime = departureDateTime;
        this.arrivalDateTime = arrivalDateTime;
    }

    /**
     * Create a Leg object from a Flight object and other information
     *
     * The departure date is calculated using the departure airport timezone
     *
     * Calculating the arrival date is more complicated because the flight can arrive a day later
     * or even a day before the departure day. It can even arrive on the previous year!.
     *
     * To calculate it we will compare the departure and arrival times on the destination airport timezone
     *
     * For example if the time on arrival (0:30) looks like it happened before the departure time (23:50),
     * it's because the arrival happened a day after the departure. If the time on arrival (23:50) is later
     * than the time of departure (23:00)
     *
     * @param flight
     * @param departure
     * @param arrival
     * @param date
     * @return
     */
    public static Leg fromFlight(
            final Flight flight,
            final String departure,
            final String arrival,
            final LocalDate date) {

        //
        ZonedDateTime departureDate = ZonedDateTime.of(
                date, LocalTime.parse(flight.getDepartureTime()), TimeUtils.zoneFromAirport(departure));

        //
        LocalTime destinationTimeOnArrival = LocalTime.parse(flight.getArrivalTime());

        ZonedDateTime destinationDateOnDeparture =
                departureDate.withZoneSameInstant(TimeUtils.zoneFromAirport(arrival));

        LocalTime destinationTimeOnDeparture = LocalTime.of(
                destinationDateOnDeparture.getHour(), destinationDateOnDeparture.getMinute());

        Duration timeDifference = Duration.between(destinationTimeOnDeparture, destinationTimeOnArrival);
        if (timeDifference.isNegative()) {
            timeDifference = timeDifference.plusHours(24);
        }

        ZonedDateTime arrivalDate = destinationDateOnDeparture.plus(timeDifference);

        return new Leg(departure, arrival, departureDate, arrivalDate);
    }

    public boolean valid() {
        return departureDateTime.isBefore(arrivalDateTime);
    }

    public String getDepartureAirport() {
        return departureAirport;
    }

    public void setDepartureAirport(String departureAirport) {
        this.departureAirport = departureAirport;
    }

    public String getArrivalAirport() {
        return arrivalAirport;
    }

    public void setArrivalAirport(String arrivalAirport) {
        this.arrivalAirport = arrivalAirport;
    }

    public ZonedDateTime getDepartureDateTime() {
        return departureDateTime;
    }

    public void setDepartureDateTime(ZonedDateTime departureDateTime) {
        this.departureDateTime = departureDateTime;
    }

    public ZonedDateTime getArrivalDateTime() {
        return arrivalDateTime;
    }

    public void setArrivalDateTime(ZonedDateTime arrivalDateTime) {
        this.arrivalDateTime = arrivalDateTime;
    }

    @Override
    public String toString() {
        return "Leg{" +
                "departureAirport='" + departureAirport + '\'' +
                ", arrivalAirport='" + arrivalAirport + '\'' +
                ", departureDateTime=" + departureDateTime +
                ", arrivalDateTime=" + arrivalDateTime +
                '}';
    }
}

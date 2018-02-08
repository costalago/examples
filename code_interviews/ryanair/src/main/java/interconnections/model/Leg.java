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
     * To calculate it we will first calculate the departure date time on the destination airport timezone
     * and then we will calculate the difference between that date's hour and minute and
     * the arrival hour and minute provided in the flight object. If the flight arrived on the next day
     * this difference will be negative. In that case we have to add 24 hours to it
     * to fix it and make it positive. Finally we add that fixed difference to the departure date time
     * on the destination airport timezone to get the correct arrival date time.
     *
     * For example:
     *
     * Flight:
     *  departure date: 2018/01/01
     *  origin: MAD,
     *  dest: DUB,
     *  departure time: 22:50 (MAD timezone)
     *  arrival time: 0:30 (DUB timezone)
     *
     * 1. Calculate departure datetime on MAD timezone : 2018/01/01 22:50 (MAD timezone)
     * 2. Calculate departure datetime on DUB timezone : 2018/01/01 23:50 (DUB timezone)
     * 3. Calculate unfixed arrival time on DUB timezone : 23:50 (DUB timezone)
     * 4. Calculate duration between departure and arrival times in DUB timezone:
     *  duration(23:50, 00:30) = -23:20
     * 5. Fix duration if it's negative by adding 24 hours because we want to add it to the
     * arrival datetime and time only goes forward:
     *  -23:20 + 24:00 = 00:40
     * 6. Add duration to the departure datetime on DUB timezone to obtain the correct arrival datetime:
     * 2018/01/01 23:50 (DUB timezone) + 00:40 = 2018/01/02 00:30 (DUB timezone)
     *
     * The code below is commented with each step of this example.
     *
     * @param flight
     * @param departure
     * @param arrival
     * @param date
     * @return
     */
    public static Leg fromFlight(
            final Flight flight,
            final String departure, // MAD
            final String arrival,   // DUB
            final LocalDate date) {

        // 1. 2018/01/01 22:50 (MAD timezone)
        ZonedDateTime departureDate = ZonedDateTime.of(
                date, LocalTime.parse(flight.getDepartureTime()), TimeUtils.zoneFromAirport(departure));

        LocalTime destinationTimeOnArrival = LocalTime.parse(flight.getArrivalTime());

        // 2. 2018/01/01 23:50 (DUB timezone)
        ZonedDateTime destinationDateOnDeparture =
                departureDate.withZoneSameInstant(TimeUtils.zoneFromAirport(arrival));

        // 3. 23:50
        LocalTime destinationTimeOnDeparture = LocalTime.of(
                destinationDateOnDeparture.getHour(), destinationDateOnDeparture.getMinute());

        // 4. duration(23:50, 00:30) = -23:20
        Duration timeDifference = Duration.between(destinationTimeOnDeparture, destinationTimeOnArrival);
        if (timeDifference.isNegative()) {
            // 5. -23:20 + 24:00 = 00:40
            timeDifference = timeDifference.plusHours(24);
        }

        // 6. 2018/01/01 23:50 (DUB timezone) + 00:40 = 2018/01/02 00:30 (DUB timezone)
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

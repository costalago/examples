package com.lastminute.flights.impl;

import com.lastminute.commons.CsvFiles;
import com.lastminute.flights.Airport;
import com.lastminute.flights.Flight;
import com.lastminute.flights.FlightNetwork;
import org.jetbrains.annotations.NotNull;
import org.junit.BeforeClass;
import org.junit.Test;

import java.util.List;

import static com.lastminute.flights.impl.LastMinuteFlightNetwork.calculateFlightTicketPrice;
import static java.util.Arrays.asList;
import static org.hamcrest.core.Is.is;
import static org.hamcrest.core.IsCollectionContaining.hasItems;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;

public class LastMinuteFlightNetworkTest {

    private static List<List<String>> routeRecords;
    private static List<List<String>> priceRecords;

    @NotNull
    private static Flight createFlight(String origin, String destination, float price, String code) {
        return new Flight(new Airport(origin), new Airport(destination), price, code);
    }

    @BeforeClass
    public static void setup() {
        String routesFullPath = LastMinuteFlightNetwork.class.getClassLoader().getResource("flight-routes.csv").getPath();
        String pricesFullPath = LastMinuteFlightNetwork.class.getClassLoader().getResource("flight-prices.csv").getPath();

        routeRecords = CsvFiles.readAllRecords(routesFullPath);
        priceRecords = CsvFiles.readAllRecords(pricesFullPath);
    }

    @Test
    public void createFlightNetworkFromRecords_originalCSV() {
        LastMinuteFlightNetwork.createFlightNetworkFromRecords(routeRecords, priceRecords);
    }

    @Test(expected = IllegalArgumentException.class)
    public void createFlightNetworkFromRecords_nullPrice() {
        List<List<String>> routeRecords = asList(
                asList("CPH", "FRA", "IB2818"),
                asList("MAD", "FRA", "FR7521"));

        List<List<String>> priceRecords = asList(
                asList("IB2818", "186"),
                asList("FR7521", null));

        LastMinuteFlightNetwork.createFlightNetworkFromRecords(routeRecords, priceRecords);
    }

    @Test(expected = IllegalArgumentException.class)
    public void createFlightNetworkFromRecords_negativePrice() {
        List<List<String>> routeRecords = asList(
                asList("CPH", "FRA", "IB2818"),
                asList("MAD", "FRA", "FR7521"));

        List<List<String>> priceRecords = asList(
                asList("IB2818", "186"),
                asList("FR7521", "-20"));

        LastMinuteFlightNetwork.createFlightNetworkFromRecords(routeRecords, priceRecords);
    }

    @Test(expected = IllegalArgumentException.class)
    public void createFlightNetworkFromRecords_missingPrice() {
        List<List<String>> routeRecords = asList(
                asList("CPH", "FRA", "IB2818"),
                asList("MAD", "FRA", "FR7521"));

        List<List<String>> priceRecords = asList(
                asList("IB2818", "186"),
                asList("FR7521"));

        LastMinuteFlightNetwork.createFlightNetworkFromRecords(routeRecords, priceRecords);
    }

    @Test(expected = IllegalArgumentException.class)
    public void createFlightNetworkFromRecords_duplicateFlight() {
        List<List<String>> routeRecords = asList(
                asList("CPH", "FRA", "IB2818"),
                asList("MAD", "FRA", "IB2818"));

        List<List<String>> priceRecords = asList(
                asList("IB2818", "186"),
                asList("FR7521", "20"));

        LastMinuteFlightNetwork.createFlightNetworkFromRecords(routeRecords, priceRecords);
    }

    @Test(expected = IllegalArgumentException.class)
    public void createFlightNetworkFromRecords_duplicatePrice() {
        List<List<String>> routeRecords = asList(
                asList("CPH", "FRA", "IB2818"),
                asList("MAD", "FRA", "FR7521"));

        List<List<String>> priceRecords = asList(
                asList("IB2818", "186"),
                asList("IB2818", "20"));

        LastMinuteFlightNetwork.createFlightNetworkFromRecords(routeRecords, priceRecords);
    }

    @Test
    public void _calculateFlightTicketPrice() {
        // 1 passenger, 31 days to the departure date, flying AMS -> FRA
        Flight TK2372 = createFlight("AMS", "FRA", 197.0f, "TK2372");
        assertEquals(calculateFlightTicketPrice(TK2372, 1, 31), 157.6f, 0.0f);

        Flight TK2659 = createFlight("AMS", "FRA", 248.0f, "TK2659");
        assertEquals(calculateFlightTicketPrice(TK2659, 1, 31), 198.4f, 0.0f);

        Flight LH5909 = createFlight("AMS", "FRA", 113.0f, "LH5909");
        assertEquals(calculateFlightTicketPrice(LH5909, 1, 31), 90.4f, 0.0f);

        // 3 passengers, 15 days to the departure date, flying LHR -> IST
        Flight TK8891 = createFlight("LHR", "IST", 250.0f, "TK8891");
        assertEquals(calculateFlightTicketPrice(TK8891, 3, 15), 900.0f, 0.0f);

        Flight LH1085 = createFlight("LHR", "IST", 148.0f, "LH1085");
        assertEquals(calculateFlightTicketPrice(LH1085, 3, 15), 532.8f, 0.0f);

        // 2 passengers, 2 days to the departure date, flying BCN -> MAD
        Flight IB2171 = createFlight("BCN", "MAD", 259.0f, "IB2171");
        assertEquals(calculateFlightTicketPrice(IB2171, 2, 2), 777.0f, 0.0f);

        Flight LH5496 = createFlight("BCN", "MAD", 293.0f, "LH5496");
        assertEquals(calculateFlightTicketPrice(LH5496, 2, 2), 879.0f, 0.0f);
    }

    @Test
    public void calculateItineraryTicketPrice() {
        //TODO: for itineraries with two or more flights
    }

    @Test
    public void findSimpleItineraries() {
        FlightNetwork network = LastMinuteFlightNetwork.createFlightNetworkFromRecords(routeRecords, priceRecords);

        List<Flight> simpleItineraries = network.findSimpleItineraries(new Airport("AMS"), new Airport("FRA"));

        assertThat(simpleItineraries.size(), is(3));
        assertThat(simpleItineraries, hasItems(
                createFlight("AMS", "FRA", 197.0f, "TK2372"),
                createFlight("AMS", "FRA", 248.0f, "TK2659"),
                createFlight("AMS", "FRA", 113.0f, "LH5909")
        ));

        simpleItineraries = network.findSimpleItineraries(new Airport("LHR"), new Airport("IST"));

        assertThat(simpleItineraries.size(), is(2));
        assertThat(simpleItineraries, hasItems(
                createFlight("LHR", "IST", 250.0f, "TK8891"),
                createFlight("LHR", "IST", 148.0f, "LH1085")
        ));

        simpleItineraries = network.findSimpleItineraries(new Airport("BCN"), new Airport("MAD"));

        assertThat(simpleItineraries.size(), is(2));
        assertThat(simpleItineraries, hasItems(
                createFlight("BCN", "MAD", 259.0f, "IB2171"),
                createFlight("BCN", "MAD", 293.0f, "LH5496")
        ));

        simpleItineraries = network.findSimpleItineraries(new Airport("CDG"), new Airport("FRA"));

        assertThat(simpleItineraries.size(), is(0));
    }

    @Test
    public void findItineraries() {
        //TODO: for itineraries with two or more flights
    }

}
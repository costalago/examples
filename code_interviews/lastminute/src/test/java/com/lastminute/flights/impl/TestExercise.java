package com.lastminute.flights.impl;

import com.lastminute.commons.CsvFiles;
import com.lastminute.flights.Airport;
import com.lastminute.flights.Flight;
import com.lastminute.flights.FlightNetwork;
import com.lastminute.flights.impl.LastMinuteFlightNetwork;
import org.junit.Test;

import java.util.List;

import static org.junit.Assert.assertTrue;

public class TestExercise {

    private void answerFlightQuery(
            FlightNetwork network, String origin, String destination, int passengers, int daysToDeparture) {

        System.out.println(String.format("%d passenger, %d days to departure date, flying %s -> %s",
                passengers, daysToDeparture, origin, destination));

        List<Flight> flights = network.findSimpleItineraries(
                new Airport(origin), new Airport(destination));

        if(flights.isEmpty()) {
            System.out.println("no flights available");
        } else {
            for (Flight flight : flights) {
                System.out.println(String.format("%s, %.1f€",
                        flight.getCode(), LastMinuteFlightNetwork.calculateFlightTicketPrice(flight, passengers, daysToDeparture)));
            }
        }
    }

    /**
     *
     * This test only reproduces the exercise output
     *
     * 1 passenger, 31 days to the departure date, flying AMS -> FRA
     * flights:
     * TK2372, 157.6 €
     * TK2659, 198.4 €
     * LH5909, 90.4 €
     *
     * 3 passengers, 15 days to the departure date, flying LHR -> IST
     * flights:
     * TK8891, 900 € (3 * (120% of 250))
     * LH1085, 532.8 € (3 * (120% of 148))
     *
     * 2 passengers, 2 days to the departure date, flying BCN -> MAD
     * flights:
     * IB2171, 777 € (2 * (150% of 259))
     * LH5496, 879 € (2 * (150% of 293))
     *
     * CDG -> FRA
     * no flights available
     */
    @Test
    public void testExerciseExample() {

        String routesFullPath = LastMinuteFlightNetwork.class.getClassLoader().getResource("flight-routes.csv").getPath();
        String pricesFullPath = LastMinuteFlightNetwork.class.getClassLoader().getResource("flight-prices.csv").getPath();

        List<List<String>> routeRecords = CsvFiles.readAllRecords(routesFullPath);
        List<List<String>> priceRecords = CsvFiles.readAllRecords(pricesFullPath);

        FlightNetwork network = LastMinuteFlightNetwork.createFlightNetworkFromRecords(routeRecords, priceRecords);

        answerFlightQuery(network,"AMS", "FRA", 1, 31);
        System.out.println();
        answerFlightQuery(network, "LHR", "IST", 3, 15);
        System.out.println();
        answerFlightQuery(network, "BCN", "MAD", 2, 2);
        System.out.println();
        answerFlightQuery(network, "CDG", "FRA", 1, 1);

        assertTrue(true);
    }

}

package com.lastminute.flights.impl;

import com.google.common.collect.Sets;
import com.google.common.graph.*;
import com.lastminute.commons.GraphUtils;
import com.lastminute.flights.Airport;
import com.lastminute.flights.Flight;
import com.lastminute.flights.FlightNetwork;
import org.jetbrains.annotations.NotNull;

import java.util.*;

import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Preconditions.checkNotNull;

/**
 * <h2>LastMinuteFlightNetwork FlightNetwork implementation</h2>
 * <p>
 * We need to be able to search for available flights interconnecting any two airports and calculate
 * the price of the ticket given the days until departure and the number of passengers.
 * <p>
 * For this we need to put all the information about airports and flights in a graph structure. The
 * Guava Network class is used in this case, this class implements a kind of graph
 * that can have many edges between any two nodes. In this case we build a directed graph with nodes of
 * type Airport and edges of type Flight. Self edges or loops are allowed.
 * <p>
 * Each edge connects two airport and contains a flight code and the price of that flight.
 * <p>
 * <h3>Building the network</h3>
 * <p>
 * We can build the graph from a list of route records and a list of flight price records with the
 * {@link #createFlightNetworkFromRecords(List, List)} method. This lists have to be well formed otherwise the
 * factory will throw IllegalArgumentExceptions if it finds any errors.
 * <p>
 * <h3>Finding itineraries</h3>
 * <p>
 * With the {@link #findItineraries(Airport, Airport, int)}} and {@link #findSimpleItineraries(Airport, Airport)} methods
 * we can locate the available flights between two airports even if we want to go
 * through N intermediate airports. To do this they calls a depth first graph search algorithm on the graph
 * many times until all the available paths connecting the airports are found.
 * <p>
 * If we then find the cartesian product of all the flights on every node on each of these paths we
 * can find all the available flight combinations for every path between the airports.
 * <p>
 * In the case we only want itineraries with only one flight we can use the simplified method.
 * <p>
 * <h3>Calculating ticket prices</h3>
 * <p>
 * Once we have all the flight itineraries we can calculate the ticket price for an individual flight or for
 * all the flights in an itinerary by making an adjustment of the base price of each flight depending on
 * the days until departure and on the number of passengers. This can be done with these methods:
 * {@link #calculateFlightTicketPrice(Flight, int, int)} and {@link #calculateItineraryTicketPrice(List, int, int)}
 */
public class LastMinuteFlightNetwork implements FlightNetwork {

    private static final LinkedHashMap<Integer, Float> PRICE_PENALTIES = new LinkedHashMap<>();

    static {
        PRICE_PENALTIES.put(31, 0.8f);
        PRICE_PENALTIES.put(16, 1.0f);
        PRICE_PENALTIES.put(3, 1.2f);
        PRICE_PENALTIES.put(1, 1.5f);
    }

    private static final int MIN_ITINERARY_LENGTH = 1;
    private static final int MAX_ITINERARY_LENGTH = 3;

    @NotNull
    final private ImmutableNetwork<Airport, Flight> flightNetwork;
    @NotNull
    final private ImmutableGraph<Airport> airportGraph;

    private LastMinuteFlightNetwork(
            final Network<Airport, Flight> flightNetwork) {

        checkNotNull(flightNetwork);
        checkArgument(flightNetwork.allowsParallelEdges());
        checkArgument(flightNetwork.allowsSelfLoops());

        this.flightNetwork = ImmutableNetwork.copyOf(flightNetwork);
        airportGraph = this.flightNetwork.asGraph();
    }

    /**
     * @throws IllegalArgumentException routeRecords and priceRecords need to meet the following conditions:
     *                                  - They aren't null
     *                                  - Each record in routeRecords is composed of a list of three non null elements:
     *                                  a departure airport code, an arrival airport code and a flight code.
     *                                  - Each record in priceRecords is composed of a list of two non null elements:
     *                                  a flight code and a positive integer.
     *                                  - For each flight in the route records there must be a corresponding flight in the price records.
     *                                  - No duplicate flights are allowed
     *                                  - There must be exactly one price for each flight
     *                                  - Each airport code has a good format
     *                                  - Each flight code has a good format
     * @implNote The flight network is created with these assumptions:
     * <p>
     * - Flights are directed from one airport to another
     * - Flights departing and arriving from the same airport are allowed (loops)
     * - Multiple flights between two airports are allowed
     */
    @NotNull
    public static LastMinuteFlightNetwork createFlightNetworkFromRecords(
            final List<List<String>> routeRecords,
            final List<List<String>> priceRecords) {

        checkNotNull(routeRecords);
        checkNotNull(priceRecords);

        MutableNetwork<Airport, Flight> flightNetwork =
                NetworkBuilder
                        .directed()
                        .allowsSelfLoops(true)
                        .allowsParallelEdges(true).build();

        Map<String, Float> flightPrices = new HashMap<>();

        for (List<String> priceRecord : priceRecords) {

            try {

                if (flightPrices.get(priceRecord.get(0)) != null) {
                    throw new IllegalArgumentException(
                            String.format("Multiple prices found for flight with code %s", priceRecord.get(0)));
                }

                flightPrices.put(priceRecord.get(0), ((float) Integer.parseInt(priceRecord.get(1))));

            } catch (Exception e) {
                throw new IllegalArgumentException(
                        String.format("Problematic price record %s", priceRecord), e);
            }
        }

        Set<String> flightCodes = new HashSet<>();

        for (List<String> route : routeRecords) {

            try {
                String origin = route.get(0);
                String destination = route.get(1);
                String code = route.get(2);

                if (flightCodes.contains(code)) {
                    throw new IllegalArgumentException(String.format("Duplicated flight found %s, record: %s", code, route));
                } else {
                    flightCodes.add(code);
                }

                Airport departureAirport = new Airport(origin);
                Airport arrivalAirport = new Airport(destination);

                Flight flight;

                if (flightPrices.get(code) == null) {
                    throw new IllegalArgumentException(
                            String.format("Flight price not found for flight with code %s", code));
                } else {
                    flight = new Flight(departureAirport, arrivalAirport, flightPrices.get(code), code);
                }

                flightNetwork.addNode(departureAirport);
                flightNetwork.addNode(arrivalAirport);
                flightNetwork.addEdge(departureAirport, arrivalAirport, flight);

            } catch (Exception e) {
                throw new IllegalArgumentException(String.format("Problematic route record %s", route), e);
            }
        }

        return new LastMinuteFlightNetwork(flightNetwork);
    }

    /**
     * Adjusts the price of a flight taking into account the days until departure and
     * the number of passengers
     *
     * @param flight          flight whose price is adjusted
     * @param passengers      passengers that will go into the flight
     * @param daysToDeparture days until departure
     * @return the adjusted price
     * @implNote Ticket price is based on the number of days to the flight departure and the base price of the flight:
     * <p>
     * | days prior to the departure date | % of the base price |
     * |----------------------------------|---------------------|
     * | more than 30 (i.e. >= 31)        | 80%                 |
     * | 30 - 16                          | 100%                |
     * | 15 - 3                           | 120%                |
     * | less that 3 (i.e. <= 2)          | 150%                |
     * <p>
     * The price is also multiplied by the number of passengers and rounded to one decimal place.
     */
    public static float calculateFlightTicketPrice(
            Flight flight,
            int passengers,
            int daysToDeparture) {

        checkArgument(passengers > 0);
        checkArgument(daysToDeparture > 0);

        float result = flight.getPrice();

        // iterate over the PRICE_PENALTIES map to find the appropiate penalty for the flight price
        for (Map.Entry<Integer, Float> penalty : PRICE_PENALTIES.entrySet()) {
            if (daysToDeparture >= penalty.getKey()) {
                result *= penalty.getValue();
                break;
            }
        }

        result *= passengers;

        // round price to 1 decimal place
        return (float) Math.floor((double) result * 10) / 10;
    }

    /**
     * Calculates the ticket price of an itinerary
     *
     * @param flights         Chain of flights
     * @param daysToDeparture days until departure
     * @param passengers      number of passengers
     * @return ticket price
     * @implNote Ticket price is based on the number of days to the flight departure and the base price of the flight:
     * <p>
     * | days prior to the departure date | % of the base price |
     * |----------------------------------|---------------------|
     * | more than 30 (i.e. >= 31)        | 80%                 |
     * | 30 - 16                          | 100%                |
     * | 15 - 3                           | 120%                |
     * | less that 3 (i.e. <= 2)          | 150%                |
     * <p>
     * The price is also multiplied by the number of passengers and rounded to one decimal place.
     */
    public static float calculateItineraryTicketPrice(
            final List<Flight> flights,
            final int daysToDeparture,
            final int passengers) {

        checkNotNull(flights);
        checkArgument(daysToDeparture > 0);
        checkArgument(passengers > 0);

        float totalPrice = 0.0f;

        // Adjust prices of each flight
        for (Flight flight : flights) {
            totalPrice += calculateFlightTicketPrice(flight, passengers, daysToDeparture);
        }

        // round price to 1 decimal place
        return (float) Math.floor((double) totalPrice * 10) / 10;
    }

    @NotNull
    @Override
    public List<Flight> findSimpleItineraries(
            final Airport origin,
            final Airport destination) {

        checkNotNull(origin);
        checkNotNull(destination);

        Set<Set<List<Flight>>> itineraries = findItineraries(origin, destination, 1);

        List<Flight> result = new ArrayList<>();

        for (Set<List<Flight>> itinerary : itineraries) {
            for (List<Flight> flights : itinerary) {
                result.addAll(flights);
            }
        }

        return result;
    }

    @NotNull
    @Override
    public Set<Set<List<Flight>>> findItineraries(
            final Airport origin,
            final Airport destination,
            final int length) {

        checkNotNull(origin);
        checkNotNull(destination);
        checkArgument(length >= MIN_ITINERARY_LENGTH && length <= MAX_ITINERARY_LENGTH);

        List<List<Airport>> paths = GraphUtils.findPathsDepthLimited(
                airportGraph, origin, destination, 1, length);

        Set<Set<List<Flight>>> itineraries = new HashSet<>();

        for (List<Airport> path : paths) {

            List<Set<Flight>> possibleFlightsForPath = new ArrayList<>();

            for (int i = 0; i < path.size() - 1; i++) {
                possibleFlightsForPath.add(flightNetwork.edgesConnecting(path.get(i), path.get(i + 1)));
            }

            itineraries.add(Sets.cartesianProduct(possibleFlightsForPath));
        }

        return itineraries;
    }
}

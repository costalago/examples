package com.lastminute.flights;

import org.jetbrains.annotations.NotNull;

import java.util.List;
import java.util.Set;

public interface FlightNetwork {

    /**
     * Finds all possible simple itineraries between airport origin and airport destination,
     * Simple itineraries only have one flight and no stops. Because of this we simplify
     * the return value to a list of flights.
     *
     * @param origin      Departure airport
     * @param destination Arrival airport
     * @return
     */
    @NotNull
    List<Flight> findSimpleItineraries(
            final Airport origin,
            final Airport destination);

    /**
     * Finds all possible itineraries of a given length between airports.
     *
     * @param origin      Departure airport
     * @param destination Arrival airport
     * @param length      Length of itinerary, can include intermediate airports
     * @return Returns a list of flights for each itinerary in the set of possible itineraries on a given
     * path between to airports for any possible path between those airports.
     * <p>
     * For example:
     * <p>
     * <p>
     * Set of paths:
     * Path 1:
     *      Set of itineraries:
     *      itinerary 1:
     *          List of flights:
     *          flight A
     *          flight B
     *      itinerary 2:
     *          flight A
     *          flight C
     *      itinerary N:
     *          ...
     * Path 2:
     *      ...
     * Path N:
     *      ...
     * </p>
     */
    @NotNull
    Set<Set<List<Flight>>> findItineraries(
            final Airport origin,
            final Airport destination,
            final int length);

}

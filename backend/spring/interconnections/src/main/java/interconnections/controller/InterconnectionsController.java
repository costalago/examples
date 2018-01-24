package interconnections.controller;

import interconnections.model.Interconnection;

import java.util.List;

public interface InterconnectionsController {

    /**
     * Returns a list of flights departing from <code>departure</code> airport not earlier
     * than <code>departureDateTime</code> and arriving to <code>arrival</code> airport not later
     * than <code>arrivalDateTime</code>.
     * <p>
     * The list consists of:
     * - All direct flights if available (for example: DUB - WRO)
     * - All interconnected flights with a maximum of one stop if available (for example: DUB - STN - WRO
     * <p>
     * For interconnected flights the difference between the arrival and the next departure should be 2h
     * or greater
     *
     * The time span between <code>departureDateTime</code> and <code>latestArrival</code> is limited to
     * one month for performance reasons.
     *
     * @param departure         departure airport IATA code
     * @param arrival           arrival airport IATA code
     * @param departureDateTime departure datetime in the departure airport timezone in ISO format
     * @param arrivalDateTime   arrival datetime in the arrival airport timezone in ISO format
     * @return
     */
    List<Interconnection> interconnections(String departure, String arrival, String departureDateTime,
            String arrivalDateTime);
}

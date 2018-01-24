package interconnections.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Route {

    private String airportFrom;
    private String airportTo;
    private String connectingAirport;
    private Boolean newRoute;
    private Boolean seasonalRoute;
    private String group;

    public Route() {
    }

    public String getAirportFrom() {
        return airportFrom;
    }

    public void setAirportFrom(String airportFrom) {
        this.airportFrom = airportFrom;
    }

    public String getAirportTo() {
        return airportTo;
    }

    public void setAirportTo(String airportTo) {
        this.airportTo = airportTo;
    }

    public String getConnectingAirport() {
        return connectingAirport;
    }

    public void setConnectingAirport(String connectingAirport) {
        this.connectingAirport = connectingAirport;
    }

    public Boolean getNewRoute() {
        return newRoute;
    }

    public void setNewRoute(Boolean newRoute) {
        this.newRoute = newRoute;
    }

    public Boolean getSeasonalRoute() {
        return seasonalRoute;
    }

    public void setSeasonalRoute(Boolean seasonalRoute) {
        this.seasonalRoute = seasonalRoute;
    }

    public String getGroup() {
        return group;
    }

    public void setGroup(String group) {
        this.group = group;
    }

    @Override
    public String toString() {
        return "Route{" +
                "airportFrom='" + airportFrom + '\'' +
                ", airportTo='" + airportTo + '\'' +
                ", connectingAirport='" + connectingAirport + '\'' +
                ", newRoute=" + newRoute +
                ", seasonalRoute=" + seasonalRoute +
                ", group='" + group + '\'' +
                '}';
    }
}

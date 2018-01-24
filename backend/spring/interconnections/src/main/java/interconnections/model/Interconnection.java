package interconnections.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.ArrayList;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Interconnection {

    private int stops;
    private List<Leg> legs;

    public Interconnection() {
        legs = new ArrayList<>();
    }

    public int getStops() {
        return stops;
    }

    public void setStops(int stops) {
        this.stops = stops;
    }

    public List<Leg> getLegs() {
        return legs;
    }

    public void setLegs(List<Leg> legs) {
        this.legs = legs;
    }

    @Override
    public String toString() {
        return "Interconnection{" +
                "stops=" + stops +
                ", legs=" + legs +
                '}';
    }
}

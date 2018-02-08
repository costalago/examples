package interconnections.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.google.common.base.Preconditions;

import javax.validation.constraints.NotNull;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Interconnection {

    private int stops;
    private List<Leg> legs;

    public Interconnection() {
        legs = new ArrayList<>();
    }

    public Interconnection(int stops, List<Leg> legs) {
        this.stops = stops;
        this.legs = legs;
    }

    /**
     * Validates a given interconnection
     *
     * - The number of legs must coincide with the number of stops + 1
     * - All the legs must be valid
     * - On interconnections with multiple legs on each stop the arrival and departure
     * must be separated by a two hour span.
     *
     * @return
     */
    public boolean valid() {


        boolean valid = true;

        List<Leg> legs = this.legs;

        valid &= legs.size() == this.stops+1;

        if(getStops() == 0) {

            valid &= legs.get(0).valid();

        } else {

            for (int i = 0; i < legs.size() - 1; i++) {
                Leg leg = legs.get(i);
                Leg nextLeg = legs.get(i + 1);

                valid &= leg.valid();
                valid &= nextLeg.valid();
                valid &= leg.getArrivalDateTime().until(nextLeg.getDepartureDateTime(), ChronoUnit.HOURS) >= 2;
            }
        }

        return valid;
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

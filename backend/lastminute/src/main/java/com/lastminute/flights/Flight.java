package com.lastminute.flights;

import com.google.common.base.Preconditions;
import org.jetbrains.annotations.NotNull;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;

import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Preconditions.checkNotNull;

public class Flight {

    @NotNull
    private Airport origin;
    @NotNull
    private Airport destination;
    @NotNull
    private String code;
    private float price;

    public Flight(
            Airport origin,
            Airport destination,
            float price,
            String code) {

        checkNotNull(origin);
        checkNotNull(destination);
        checkArgument(price > 0);
        checkNotNull(code);
        Preconditions.checkArgument(
                code.matches("[A-Z0-9]{6}"), "Bad flight format, should match [A-Z0-9]{6}.");

        this.origin = origin;
        this.destination = destination;
        this.price = price;
        this.code = code;
    }

    @NotNull
    public Airport getOrigin() {
        return origin;
    }

    public void setOrigin(Airport origin) {
        this.origin = origin;
    }

    @NotNull
    public Airport getDestination() {
        return destination;
    }

    public void setDestination(Airport destination) {
        this.destination = destination;
    }

    @NotNull
    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public Float getPrice() {
        return price;
    }

    public void setPrice(Float price) {
        this.price = price;
    }


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Flight flight = (Flight) o;
        return Float.compare(flight.price, price) == 0 &&
                Objects.equals(origin, flight.origin) &&
                Objects.equals(destination, flight.destination) &&
                Objects.equals(code, flight.code);
    }

    @Override
    public int hashCode() {

        return Objects.hash(origin, destination, code, price);
    }

    @Override
    public String toString() {
        return String.format("%s -> %s (%s)", origin, destination, code);
    }
}

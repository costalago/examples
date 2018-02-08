package com.lastminute.flights;

import com.google.common.base.Preconditions;
import org.jetbrains.annotations.NotNull;

import java.util.Objects;

public class Airport {

    @NotNull
    private String code;

    public Airport(String code) {

        Preconditions.checkNotNull(code);
        Preconditions.checkArgument(code.matches("[A-Z]{3}"), "Bad airport code, should match [A-Z]{3}.");

        this.code = code;
    }

    @NotNull
    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    @Override
    public String toString() {
        return code;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Airport airport = (Airport) o;
        return Objects.equals(code, airport.code);
    }

    @Override
    public int hashCode() {

        return Objects.hash(code);
    }
}

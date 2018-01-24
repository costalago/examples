package interconnections.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;


@JsonIgnoreProperties(ignoreUnknown = true)
public class MonthSchedule {

    private int month;
    private List<DaySchedule> days;

    public int getMonth() {
        return month;
    }

    public void setMonth(int month) {
        this.month = month;
    }

    public List<DaySchedule> getDays() {
        return days;
    }

    public void setDays(List<DaySchedule> days) {
        this.days = days;
    }

    @Override
    public String toString() {
        return "MonthSchedule{" +
                "month=" + month +
                ", days=" + days +
                '}';
    }
}

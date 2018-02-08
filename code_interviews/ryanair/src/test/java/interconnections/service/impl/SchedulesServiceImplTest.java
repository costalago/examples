package interconnections.service.impl;

import interconnections.commons.TimeUtils;
import interconnections.model.Leg;
import interconnections.service.SchedulesService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.time.ZonedDateTime;
import java.util.List;

import static org.junit.Assert.*;

@RunWith(SpringRunner.class)
@SpringBootTest
public class SchedulesServiceImplTest {

    @Autowired
    SchedulesService schedulesService;

    @Test
    public void getLegs() throws Exception {

        List<Leg> legs = schedulesService.getLegs("DUB", "WRO",
                ZonedDateTime.of(
                        2018, 03, 01, 7, 0, 0, 0,
                        TimeUtils.zoneFromAirport("DUB")),
                ZonedDateTime.of(
                        2018, 03, 03, 21, 0, 0, 0,
                        TimeUtils.zoneFromAirport("WRO")));

        assertTrue(legs != null);
    }

    @Test
    public void getSchedule() {
    }
}
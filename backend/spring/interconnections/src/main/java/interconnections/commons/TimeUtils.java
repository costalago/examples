package interconnections.commons;

import java.io.File;
import java.io.FileNotFoundException;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.Map;
import java.util.Scanner;

/**
 * Static class that loads all the airport timezones on class load
 * from a iata.tzmap resource file.
 */
final public class TimeUtils {

    final public static Map<String, String> airportTimezones = new HashMap<>();

    private TimeUtils() {}

    static {
        try {
            ClassLoader classLoader = TimeUtils.class.getClassLoader();

            Scanner scanner = new Scanner(new File(classLoader.getResource("iata.tzmap").getFile()));

            while (scanner.hasNext()) {
                String[] split = scanner.nextLine().split("\t");
                airportTimezones.put(split[0], split[1]);
            }
        } catch (FileNotFoundException e) {
            throw new RuntimeException(e);
        }
    }

    public static ZoneId zoneFromAirport(String IATAcode) {
        return ZoneId.of(airportTimezones.get(IATAcode));
    }
}

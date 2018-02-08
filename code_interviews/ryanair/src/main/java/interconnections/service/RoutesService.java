package interconnections.service;

import javax.annotation.Nonnull;
import java.util.List;

public interface RoutesService {

    /**
     * Returns a list of paths between <code>departure</code> and <code>arrival</code>
     * airports
     *
     * @param departure     IATA departure airport
     * @param arrival       IATA arrival airport
     * @param minPathLength min path length between departure and arrival airports
     * @param maxPathLenght max path length between departure and arrival airports
     * @return
     */
    List<List<String>> getPaths(
            @Nonnull String departure,
            @Nonnull String arrival,
            int minPathLength,
            int maxPathLenght);
}

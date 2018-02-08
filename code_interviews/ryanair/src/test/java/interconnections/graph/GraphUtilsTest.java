package interconnections.graph;

import com.google.common.graph.GraphBuilder;
import com.google.common.graph.ImmutableGraph;
import com.google.common.graph.MutableGraph;
import interconnections.model.Route;
import org.junit.Test;

import java.util.List;

import static org.junit.Assert.*;

public class GraphUtilsTest {

    @Test
    public void findPathsDepthLimited() {

        MutableGraph<String> routeGraph = GraphBuilder.directed().build();
        routeGraph.putEdge("DUB", "JOS");
        routeGraph.putEdge("DUB", "MAD");
        routeGraph.putEdge("DUB", "JFK");
        routeGraph.putEdge("JOS", "DUB");
        routeGraph.putEdge("JOS", "MAD");
        routeGraph.putEdge("JOS", "BCN");
        routeGraph.putEdge("MAD", "DUB");
        routeGraph.putEdge("MAD", "JOS");
        routeGraph.putEdge("MAD", "BCN");
        routeGraph.putEdge("MAD", "VAL");
        routeGraph.putEdge("MAD", "JFK");
        routeGraph.putEdge("BCN", "JOS");
        routeGraph.putEdge("BCN", "MAD");
        routeGraph.putEdge("BCN", "VAL");
        routeGraph.putEdge("VAL", "BCN");
        routeGraph.putEdge("VAL", "MAD");
        routeGraph.putEdge("VAL", "JFK");
        routeGraph.putEdge("JFK", "VAL");
        routeGraph.putEdge("JFK", "MAD");
        routeGraph.putEdge("JFK", "DUB");

        List<List<String>> paths = GraphUtils.findPathsDepthLimited(
                ImmutableGraph.copyOf(routeGraph), "DUB", "VAL", 2);

        assertNotNull(paths);
        assertTrue(paths.size() == 2);
        List<String> path1 = paths.get(0);
        assertTrue(path1.size() == 3);
        assertTrue(path1.get(0) == "DUB");
        assertTrue(path1.get(1) == "MAD");
        assertTrue(path1.get(2) == "VAL");
        List<String> path2 = paths.get(1);
        assertTrue(path2.size() == 3);
        assertTrue(path2.get(0) == "DUB");
        assertTrue(path2.get(1) == "JFK");
        assertTrue(path2.get(2) == "VAL");
    }


}
package com.lastminute.commons;

import com.google.common.graph.ImmutableGraph;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Utilities for working with Guava graphs
 */
public class GraphUtils {

    /**
     * Finds all paths of length 1 between start and goal
     *
     * @param graph
     * @param start
     * @param goal
     * @param <T>
     * @return
     */
    public static <T> List<List<T>> findPathsBasic(
            final ImmutableGraph<T> graph,
            final T start,
            final T goal) {
        return findPathsDepthLimited(graph, goal, start, 1, 1);
    }

    /**
     * Finds all paths from the <code>start</code> node to the <code>goal</code> in <code>graph</code>.
     * The paths found have at most <code>max_detph</code> length
     *
     * @param graph    Guava graph were paths are found
     * @param start    Node were searched paths begin
     * @param goal     Node were searched paths end
     * @param maxDepth Maximum length of searched paths
     * @param minDepth Minimum path length of searched paths
     * @param <T>      Type of graph nodes
     * @return returns a list of paths
     */
    public static <T> List<List<T>> findPathsDepthLimited(
            final ImmutableGraph<T> graph,
            final T start,
            final T goal,
            final int minDepth,
            final int maxDepth) {

        //TODO: Make iterative version

        List<List<T>> resultPaths = new ArrayList<>();
        Set<T> explored = new HashSet<>();
        List<T> currentPath = new ArrayList<>();
        currentPath.add(start);

        _findPathsDepthLimited(graph, start, goal, currentPath, explored, resultPaths, minDepth, maxDepth);

        return resultPaths;
    }

    /**
     * Recursive part of <code>findPathsDepthLimited</code>
     *
     * @param graph       Guava graph were paths are found
     * @param current     current node being visited
     * @param goal        Node were searched paths end
     * @param currentPath Each path will be stored here temporarily until the goal node is found
     * @param explored    Nodes that have been already explored, used to prevent revisiting nodes
     * @param resultPaths Whenever a path is found from the start node to the goal node it is saved here
     * @param depth       Maximum length of valid paths
     * @param minDepth    Minimum path length of searched paths
     * @param <T>         Type of graph nodes
     */
    private static <T> void _findPathsDepthLimited(
            final ImmutableGraph<T> graph,
            final T current,
            final T goal,
            final List<T> currentPath,
            final Set<T> explored,
            final List<List<T>> resultPaths,
            final int minDepth,
            final int depth) {

        //TODO: Make iterative version

        explored.add(current);

        if (current.equals(goal) && currentPath.size() > minDepth) {
            resultPaths.add(new ArrayList<>(currentPath));
        }

        if (depth > 0) {
            for (T child : graph.adjacentNodes(current)) {
                if (!explored.contains(child)) {
                    currentPath.add(child);
                    _findPathsDepthLimited(
                            graph, child, goal, currentPath, explored, resultPaths, minDepth, depth - 1);
                    currentPath.remove(child);
                }
            }
        }

        explored.remove(current);
    }


}

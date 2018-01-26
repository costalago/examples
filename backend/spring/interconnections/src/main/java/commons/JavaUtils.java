package commons;

import com.google.common.collect.ContiguousSet;
import com.google.common.collect.DiscreteDomain;
import com.google.common.collect.Range;
import com.google.common.collect.Sets;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * Very general utilities that can be used for almost any application
 */
public class JavaUtils {

    /**
     * Given a list of lists this method returns
     * indices to index all possible ordered combinations of the elements inside the lists
     *
     * For example if we have these lists:
     * [ [2, 3, 4], [5, 6], [7] ]
     *
     * The returned indices are :
     *
     * Set ( [ 0, 0, 0 ], [0, 1, 0], [1, 0, 0], [1, 1, 0], [2, 0, 0], [2, 1, 0] )
     *
     * @param lists
     * @param <T>
     * @return
     */
    public static <T> Set<List<Integer>> getOrderedCombinationsIndices(List<List<T>> lists) {

        List<Set<Integer>> sets = new ArrayList<>();
        for (List<?> list : lists) {
            if (list.size() > 0) {
                sets.add(ContiguousSet.create(
                        Range.closedOpen(0, list.size()), DiscreteDomain.integers()));
            }
        }
        return Sets.cartesianProduct(sets);
    }

    /**
     * Given a list of lists this method returns
     * all values indexed by the provided lists of indices
     *
     * For example if we have these lists:
     * [ [2, 3, 4], [5, 6], [7] ]
     *
     * and these indices:
     * Set ( [ 0, 0, 0 ], [0, 1, 0], [1, 0, 0], [1, 1, 0], [2, 0, 0], [2, 1, 0] )
     *
     * The returned values are :
     * Set ( [ 2, 5, 7 ], [2, 6, 7], [3, 5, 7], [3, 6, 7], [4, 5, 7], [4, 6, 7] )
     *
     * @param lists
     * @param <T>
     * @return
     */
    public static  <T> List<List<T>> getListsValuesFromIndices(
            Set<List<Integer>> combinationsIndices,
            List<List<T>> lists) {

        List<List<T>> combinationValues = new ArrayList<>();

        for (List<Integer> combinationIndices : combinationsIndices) {
            if(lists.size() == combinationIndices.size()) {
                List<T> values = new ArrayList<>();

                for (int i = 0; i < lists.size(); i++) {
                    values.add(lists.get(i).get(combinationIndices.get(i)));
                }

                combinationValues.add(values);
            }
        }

        return combinationValues;
    }

    /**
     * Given a list of lists this method returns
     * all possible ordered combinations of the elements inside the lists
     *
     * For example if we have these lists:
     * [ [2, 3, 4], [5, 6], [7] ]
     *
     * The returned values are :
     *
     * Set ( [ 2, 5, 7 ], [2, 6, 7], [3, 5, 7], [3, 6, 7], [4, 5, 7], [4, 6, 7] )
     *
     * @param lists
     * @param <T>
     * @return
     */
    public static <T> List<List<T>> getOrderedCombinations(List<List<T>> lists) {
        return getListsValuesFromIndices(getOrderedCombinationsIndices(lists), lists);
    }

}
